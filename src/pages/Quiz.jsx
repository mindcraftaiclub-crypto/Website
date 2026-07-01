import { useState, useEffect } from 'react';
import db from '../db';
import TiltCard from '../components/TiltCard';
import Reveal from '../components/Reveal';

export default function Quiz({ user }) {
  const [view, setView] = useState('dashboard');
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [lastScore, setLastScore] = useState({ score: 0, total: 0, timeSpent: 0 });

  const fetchDashboardData = async () => {
    try {
      const allQuizzes = await db.find('Quiz');
      setQuizzes(allQuizzes.filter(q => q.published));
      const allResults = await db.find('QuizResults');
      setResults(allResults);
      if (user) setMyResults(allResults.filter(r => r.userId === user.id));
      const leaderMap = {};
      allResults.forEach(r => {
        if (!leaderMap[r.userId] || r.score > leaderMap[r.userId].score) leaderMap[r.userId] = r;
      });
      setLeaderboard(Object.values(leaderMap).sort((a, b) => (b.score / b.total) - (a.score / a.total)).slice(0, 10));
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchDashboardData(); }, [user]);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setTimeRemaining(quiz.timeLimit * 60);
    setTimeSpent(0);
    setView('active');
  };

  useEffect(() => {
    if (view !== 'active' || !currentQuiz || timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) { clearInterval(timer); submitQuiz(); return 0; }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [view, currentQuiz]);

  const selectAnswer = (answerIndex) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = answerIndex;
    setUserAnswers(updated);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) setCurrentQuestionIndex(prev => prev + 1);
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1);
  };

  const submitQuiz = async () => {
    const total = currentQuiz.questions.length;
    let score = 0;
    currentQuiz.questions.forEach((q, i) => { if (userAnswers[i] === q.answerIndex) score++; });
    setLastScore({ score, total, timeSpent });
    setView('result');
    if (user) {
      try {
        await db.insert('QuizResults', {
          userId: user.id, userName: user.name, quizId: currentQuiz.id,
          quizTitle: currentQuiz.title, score, total,
          timeSpent: Math.floor(timeSpent), date: new Date().toISOString(),
        });
        fetchDashboardData();
      } catch { /* ignore */ }
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (view === 'dashboard') {
    return (
      <div className="animated-entrance">
        <div className="page-header">
          <span className="page-tag"><i className="fa-solid fa-brain"></i> Assessment</span>
          <h2 className="page-title">Weekly Quiz</h2>
          <p className="page-subtitle">Test your knowledge across JavaScript, CSS, Python, and AI concepts in timed weekly challenges.</p>
        </div>

        <Reveal direction="up">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Available Quizzes</h3>
          <div className="grid-auto">
            {quizzes.map((q, i) => (
              <Reveal key={q.id} direction="up" delay={`${i * 0.08}s`}>
                <TiltCard tiltDegree={5}>
                  <div style={{ background: 'var(--card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.3rem' }}>{q.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>{q.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.questions?.length || 0} questions · {q.timeLimit} min</span>
                      <button className="btn btn-primary btn-sm" onClick={() => startQuiz(q)} style={{ borderRadius: 'var(--radius-sm)' }}>Start</button>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {myResults.length > 0 && (
          <Reveal direction="up" delay="0.1s">
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Your Results</h3>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                {myResults.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{r.quizTitle}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{new Date(r.date).toLocaleDateString()}</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: r.score === r.total ? '#16a34a' : 'var(--orange)' }}>{r.score}/{r.total}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    );
  }

  if (view === 'active' && currentQuiz) {
    const question = currentQuiz.questions[currentQuestionIndex];
    return (
      <div className="animated-entrance">
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--orange)' }}>{currentQuiz.title}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>Question {currentQuestionIndex + 1}/{currentQuiz.questions.length}</span>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: timeRemaining < 60 ? '#dc2626' : 'var(--orange)', fontFamily: 'var(--font-display)' }}>
              ⏱ {formatTime(timeRemaining)}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-md)', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1.5rem', lineHeight: 1.5 }}>{question.question}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {question.options.map((opt, j) => (
                <button key={j} onClick={() => selectAnswer(j)} style={{
                  textAlign: 'left', padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: userAnswers[currentQuestionIndex] === j ? 'rgba(var(--orange-rgb), 0.1)' : 'var(--surface)',
                  border: userAnswers[currentQuestionIndex] === j ? '1px solid var(--orange)' : '1px solid var(--border-light)',
                  color: userAnswers[currentQuestionIndex] === j ? 'var(--orange)' : 'var(--text)',
                  fontWeight: 500, fontSize: '0.9rem',
                  transition: 'all var(--transition)',
                }}>
                  <span style={{ fontWeight: 700, marginRight: '0.75rem', color: userAnswers[currentQuestionIndex] === j ? 'var(--orange)' : 'var(--text-muted)' }}>{String.fromCharCode(65 + j)}</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-outline btn-sm" onClick={prevQuestion} disabled={currentQuestionIndex === 0} style={{ borderRadius: 'var(--radius-sm)', opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}>← Previous</button>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {currentQuiz.questions.map((_, j) => (
                <div key={j} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: j === currentQuestionIndex ? 'var(--orange)' : userAnswers[j] !== undefined ? 'rgba(var(--orange-rgb), 0.3)' : 'var(--border)',
                }} />
              ))}
            </div>
            {currentQuestionIndex < currentQuiz.questions.length - 1 ? (
              <button className="btn btn-primary btn-sm" onClick={nextQuestion} style={{ borderRadius: 'var(--radius-sm)' }}>Next →</button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={submitQuiz} style={{ borderRadius: 'var(--radius-sm)', background: '#16a34a', borderColor: '#16a34a' }}>Submit Quiz</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'result') {
    const percentage = Math.round((lastScore.score / lastScore.total) * 100);
    return (
      <div className="animated-entrance">
        <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <TiltCard tiltDegree={5}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '💪'}</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem', color: 'var(--text)', marginBottom: '0.5rem' }}>Quiz Complete!</h2>
              <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: percentage >= 80 ? '#16a34a' : 'var(--orange)', marginBottom: '0.5rem' }}>
                {lastScore.score}/{lastScore.total}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>You scored {percentage}%</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Time taken: {formatTime(lastScore.timeSpent)}</p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="btn btn-primary" onClick={() => setView('dashboard')} style={{ borderRadius: 'var(--radius-md)' }}>Back to Dashboard</button>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    );
  }

  return null;
}
