// Client-side Database Manager utilizing LocalStorage & Firebase Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const DB_PREFIX = 'mindcraft_club_';

// Firebase Configuration parameters from .env
const firebaseConfig = {
  apiKey: "AIzaSyC69hQb92bkySfsd_2NfHcg7YgYLVj8DRs",
  authDomain: "website-b84d2.firebaseapp.com",
  projectId: "website-b84d2",
  storageBucket: "website-b84d2.firebasestorage.app",
  messagingSenderId: "183506006508",
  appId: "1:183506006508:web:fd3e07251811a4282550c9",
  measurementId: "G-SK9TEMW5Y1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initial Mock Data Sets
const initialCollections = {
  Users: [
    {
      id: 'usr_1', // Seed ID, will be updated to Firebase UID upon first Firebase login
      name: 'Athithyan',
      email: 'admin@club.com',
      role: 'admin',
      department: 'Computer Science',
      year: '4',
      position: 'Technical Lead',
      skills: ['React', 'Node.js', 'Python', 'Tailwind'],
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      verified: true,
      createdAt: '2026-01-10T12:00:00Z'
    },
    {
      id: 'usr_2',
      name: 'Jane Doe',
      email: 'member@club.com',
      role: 'member',
      department: 'Information Technology',
      year: '3',
      position: 'Member',
      skills: ['HTML', 'CSS', 'JavaScript'],
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      verified: true,
      createdAt: '2026-02-15T09:30:00Z'
    },
    {
      id: 'usr_3',
      name: 'Alice Johnson',
      email: 'alice@club.com',
      role: 'member',
      department: 'Electronics',
      year: '2',
      position: 'Member',
      skills: ['Embedded Systems', 'C++', 'IoT'],
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      verified: true,
      createdAt: '2026-03-01T14:15:00Z'
    }
  ],
  CoreMembers: [
    {
      id: 'core_1',
      name: 'Athithyan',
      role: 'Technical Lead',
      department: 'Computer Science',
      year: '4',
      email: 'admin@club.com',
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    },
    {
      id: 'core_2',
      name: 'Marcus Sterling',
      role: 'President',
      department: 'Computer Science',
      year: '4',
      email: 'marcus@club.com',
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    {
      id: 'core_3',
      name: 'Serena Vance',
      role: 'Vice President',
      department: 'Information Technology',
      year: '4',
      email: 'serena@club.com',
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
      id: 'core_4',
      name: 'Nolan Hayes',
      role: 'Secretary',
      department: 'Electronics',
      year: '3',
      email: 'nolan@club.com',
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    },
    {
      id: 'core_5',
      name: 'Elena Rostova',
      role: 'Treasurer',
      department: 'Business Analytics',
      year: '3',
      email: 'elena@club.com',
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    {
      id: 'core_6',
      name: 'Leo Daniels',
      role: 'Event Coordinator',
      department: 'Mechanical',
      year: '3',
      email: 'leo@club.com',
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
    }
  ],
  Projects: [
    {
      id: 'proj_1',
      title: 'Mindcraft Design System',
      description: 'A fully responsive, glassmorphic UI library focusing on accessibility and seamless web animation patterns.',
      tech: ['HTML', 'CSS', 'JavaScript', 'Framer Motion Core'],
      github: 'https://github.com',
      live: 'https://example.com',
      members: ['Athithyan', 'Marcus Sterling'],
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400'
    },
    {
      id: 'proj_2',
      title: 'IoT Weather Hub',
      description: 'Microcontroller network collecting temperature, humidity, and pressure coordinates, broadcasting data in real time.',
      tech: ['Raspberry Pi', 'Python', 'WebSockets', 'Chart.js'],
      github: 'https://github.com',
      live: 'https://example.com',
      members: ['Alice Johnson', 'Nolan Hayes'],
      status: 'In Progress',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400'
    },
    {
      id: 'proj_3',
      title: 'EduConnect Platform',
      description: 'Web application designed to bridge students and mentors for resume uploads, peer feedback, and resources curation.',
      tech: ['Next.js', 'PostgreSQL', 'Tailwind', 'JWT'],
      github: 'https://github.com',
      live: 'https://example.com',
      members: ['Serena Vance', 'Elena Rostova'],
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400'
    }
  ],
  Gallery: [
    {
      id: 'gal_1',
      title: 'Summer Hackathon 2026',
      category: 'Hackathon',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
      description: '24 hours of coding, pizza, and innovative concepts built by club members.'
    },
    {
      id: 'gal_2',
      title: 'React Performance Workshop',
      category: 'Workshop',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      description: 'Interactive session exploring virtual DOM, code-splitting, and render optimization.'
    },
    {
      id: 'gal_3',
      title: 'Guest Seminar: AI Ethics',
      category: 'Seminar',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600',
      description: 'Keynote address by industry researchers about alignment, safety, and agent deployments.'
    },
    {
      id: 'gal_4',
      title: 'National Coding Championship Trophy',
      category: 'Achievement',
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
      description: 'Our technical team secured 1st place in the national code sprint event.'
    }
  ],
  Events: [
    {
      id: 'evt_1',
      title: 'Cybersecurity Bootcamp & CTF',
      description: 'Dive deep into offensive and defensive security practices. Learn penetration testing, network sniffing, and participate in a 6-hour Capture The Flag challenge.',
      venue: 'Lab 4, Tech Block',
      date: '2026-08-15',
      time: '09:00',
      poster: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400',
      registeredUsers: ['usr_2']
    },
    {
      id: 'evt_2',
      title: 'Clean Code Meetup',
      description: 'Focusing on refactoring, design principles (SOLID, DRY), and standard design patterns. Bring a piece of code you want to optimize together with peers.',
      venue: 'Seminar Hall B',
      date: '2026-07-20',
      time: '14:30',
      poster: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=400',
      registeredUsers: []
    },
    {
      id: 'evt_3',
      title: 'Intro to Web3 & Smart Contracts',
      description: 'Past event covering decentralized storage, Solidity basics, and deploying contract systems on local test networks.',
      venue: 'Virtual Teams Link',
      date: '2026-05-10',
      time: '18:00',
      poster: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400',
      registeredUsers: ['usr_1', 'usr_2', 'usr_3']
    }
  ],
  Resources: [
    {
      id: 'res_1',
      title: 'Advanced React Optimization Slides',
      category: 'PPT',
      description: 'Deck explaining React.memo, useMemo, useCallback, and React 19 concurrent features.',
      link: 'https://example.com/files/react-opt.pptx',
      size: '4.2 MB'
    },
    {
      id: 'res_2',
      title: 'Introduction to Rust Programming Guide',
      category: 'PDF',
      description: 'Comprehensive guide covering ownership, borrowing, lifetimes, and safety guarantees.',
      link: 'https://example.com/files/intro-rust.pdf',
      size: '2.8 MB'
    },
    {
      id: 'res_3',
      title: 'Full Stack Starter Kit Repository',
      category: 'GitHub Links',
      description: 'Template repository preloaded with Express, JWT authentication, and SQLite configuration.',
      link: 'https://github.com',
      size: 'External Link'
    },
    {
      id: 'res_4',
      title: 'Machine Learning Basics Workshop Recording',
      category: 'Videos',
      description: 'Full video walkthrough covering linear regression, gradient descent, and PyTorch.',
      link: 'https://youtube.com',
      size: 'Video Stream'
    }
  ],
  Quiz: [
    {
      id: 'qz_1',
      title: 'Weekly JavaScript Quiz: Scopes & Closures',
      description: 'Test your understanding of lexical scoping, hoisting, closures, and the event loop.',
      timeLimit: 60,
      published: true,
      questions: [
        {
          question: 'What will be logged: console.log(typeof NaN)?',
          options: ['"number"', '"nan"', '"undefined"', '"object"'],
          answerIndex: 0
        },
        {
          question: 'Which keyword creates a block-scoped variable?',
          options: ['var', 'let', 'function', 'define'],
          answerIndex: 1
        },
        {
          question: 'What is the output: (function(){ var a = b = 3; })(); console.log(typeof a, typeof b);?',
          options: ['"undefined" "number"', '"number" "undefined"', '"number" "number"', '"undefined" "undefined"'],
          answerIndex: 0
        }
      ]
    },
    {
      id: 'qz_2',
      title: 'Weekly CSS Grid & Layout Masterclass',
      description: 'Evaluate your layout strategies, centering techniques, and grid constraints.',
      timeLimit: 90,
      published: true,
      questions: [
        {
          question: 'Which value of justify-content aligns items with equal space around them, but half-spaces on edges?',
          options: ['space-between', 'space-around', 'space-evenly', 'stretch'],
          answerIndex: 1
        },
        {
          question: 'How do you define a grid column to take twice the space of another?',
          options: ['width: 2fr', 'grid-template-columns: 2fr 1fr', 'flex: 2', 'column-span: 2'],
          answerIndex: 1
        }
      ]
    }
  ],
  QuizResults: [
    { id: 'qr_1', userId: 'usr_2', userName: 'Jane Doe', quizId: 'qz_1', quizTitle: 'Weekly JavaScript Quiz', score: 3, total: 3, timeSpent: 22, date: '2026-06-25T10:00:00Z' },
    { id: 'qr_2', userId: 'usr_3', userName: 'Alice Johnson', quizId: 'qz_1', quizTitle: 'Weekly JavaScript Quiz', score: 2, total: 3, timeSpent: 38, date: '2026-06-25T11:15:00Z' },
    { id: 'qr_3', userId: 'usr_2', userName: 'Jane Doe', quizId: 'qz_2', quizTitle: 'Weekly CSS Grid Masterclass', score: 2, total: 2, timeSpent: 15, date: '2026-06-26T08:00:00Z' }
  ],
  WeeklyTasks: [
    {
      id: 'tsk_1',
      title: 'Glassmorphic Card Re-creation',
      description: 'Design and build a gorgeous glassmorphic product card using custom CSS shadows, dynamic HSL colors, and blur backdrops. Submit a single HTML file containing styles.',
      deadline: '2026-07-02T23:59:00Z',
      active: true
    },
    {
      id: 'tsk_2',
      title: 'Algorithm Optimization: Array Deduplication',
      description: 'Write an optimized JavaScript algorithm to deduplicate arrays with over 10,000 coordinates. Measure execution time and document benchmarks.',
      deadline: '2026-06-20T23:59:00Z',
      active: false
    }
  ],
  TaskSubmissions: [
    {
      id: 'sub_1',
      taskId: 'tsk_1',
      taskTitle: 'Glassmorphic Card Re-creation',
      userId: 'usr_2',
      userName: 'Jane Doe',
      fileName: 'jane-doe-card.html',
      submittedAt: '2026-06-26T14:20:00Z',
      status: 'Pending'
    },
    {
      id: 'sub_2',
      taskId: 'tsk_2',
      taskTitle: 'Algorithm Optimization',
      userId: 'usr_2',
      userName: 'Jane Doe',
      fileName: 'jane-dedupe-bench.js',
      submittedAt: '2026-06-19T10:10:00Z',
      status: 'Approved'
    }
  ],
  Announcements: [
    {
      id: 'ann_1',
      title: 'Club Recruitment 2026 Active!',
      content: 'We are officially open for new applications. Share the link with friends across departments who are passionate about design & engineering.',
      date: '2026-06-24',
      important: true
    },
    {
      id: 'ann_2',
      title: 'Vite & Frontend Ecosystem Seminar next Wednesday',
      content: 'Make sure to download files in the Resources panel before attending. We will construct a build pipeline from scratch.',
      date: '2026-06-22',
      important: false
    }
  ],
  JoinRequests: [
    {
      id: 'req_1',
      name: 'Bob Miller',
      department: 'Computer Science',
      college: 'Tech Institute of Technology',
      year: '2',
      phone: '+1 555-0199',
      email: 'bob@example.com',
      skills: 'Python, Basic HTML',
      interests: 'Backend Web Dev, Cyber Security',
      resume: 'bob-resume.pdf',
      status: 'Pending',
      submittedAt: '2026-06-25T16:00:00Z'
    },
    {
      id: 'req_2',
      name: 'Diana Prince',
      department: 'Electrical Engineering',
      college: 'State University',
      year: '3',
      phone: '+1 555-0188',
      email: 'diana@example.com',
      skills: 'C++, Circuit Design, Microcontrollers',
      interests: 'Embedded Development, IoT systems',
      resume: 'diana-eng.pdf',
      status: 'Pending',
      submittedAt: '2026-06-26T09:40:00Z'
    }
  ],
  WeeklyWinners: [
    {
      id: 'win_1',
      name: 'Jane Doe',
      department: 'Information Technology',
      achievement: 'Winner of Glassmorphic Card Layout challenge (Task #1)',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      certificate: 'https://example.com/cert/glassmorphic-challenge'
    },
    {
      id: 'win_2',
      name: 'Alice Johnson',
      department: 'Electronics',
      achievement: 'Fastest Deduplication Algorithm optimization (Task #2)',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      certificate: 'https://example.com/cert/deduplication-opt'
    }
  ],
  Settings: {
    siteName: 'Mindcraft AI Club',
    academicYear: '2026-2027',
    registrationStatus: 'Open',
    adminEmail: 'admin@club.com',
    announcementBanner: 'Welcome to Mindcraft AI. Check upcoming events for registrations.'
  }
};

// Database Wrapper Class
class LocalDatabase {
  constructor() {
    this.init();
    this.initFirebaseSync();
  }

  init() {
    Object.keys(initialCollections).forEach(key => {
      const dbKey = DB_PREFIX + key;
      if (!localStorage.getItem(dbKey)) {
        localStorage.setItem(dbKey, JSON.stringify(initialCollections[key]));
      }
    });
  }

  // Hook Firebase Auth state changes
  initFirebaseSync() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Find local profile linked to this Firebase UID
        let userProfile = await this.findOne('Users', { id: firebaseUser.uid });
        
        // If not found (e.g. registered externally or first load), attempt to match by email
        if (!userProfile) {
          userProfile = await this.findOne('Users', { email: firebaseUser.email });
          if (userProfile) {
            // Update the ID to link UID
            await this.update('Users', userProfile.id, { id: firebaseUser.uid });
            userProfile.id = firebaseUser.uid;
          } else {
            // Create a default metadata card
            userProfile = {
              id: firebaseUser.uid,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email: firebaseUser.email,
              role: firebaseUser.email === 'admin@club.com' ? 'admin' : 'member',
              department: 'N/A',
              year: '1',
              position: 'Member',
              skills: [],
              linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
              github: 'https://github.com',
              photo: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
              verified: true
            };
            await this.insert('Users', userProfile);
          }
        }
        
        localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
        localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
      } else {
        localStorage.removeItem('aether_user_session');
        localStorage.removeItem('aether_jwt_token');
      }
      
      // Dispatch ready signal to other components
      document.dispatchEvent(new CustomEvent('auth_state_ready', { detail: firebaseUser }));
    });
  }

  // Get all items in a collection
  async find(collection) {
    return new Promise((resolve) => {
      const dbKey = DB_PREFIX + collection;
      const data = localStorage.getItem(dbKey);
      resolve(data ? JSON.parse(data) : []);
    });
  }

  // Find a single item matching query
  async findOne(collection, queryObj) {
    const items = await this.find(collection);
    return items.find(item => {
      return Object.keys(queryObj).every(key => item[key] === queryObj[key]);
    });
  }

  // Insert a new record
  async insert(collection, record) {
    const dbKey = DB_PREFIX + collection;
    const items = JSON.parse(localStorage.getItem(dbKey) || '[]');
    if (!record.id) {
      record.id = (collection.toLowerCase().substring(0, 3)) + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    }
    record.createdAt = new Date().toISOString();
    items.push(record);
    localStorage.setItem(dbKey, JSON.stringify(items));
    return record;
  }

  // Update a record by ID
  async update(collection, id, updates) {
    const dbKey = DB_PREFIX + collection;
    const items = JSON.parse(localStorage.getItem(dbKey) || '[]');
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${collection}`);
    }
    items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(dbKey, JSON.stringify(items));
    return items[index];
  }

  // Delete a record by ID
  async delete(collection, id) {
    const dbKey = DB_PREFIX + collection;
    const items = JSON.parse(localStorage.getItem(dbKey) || '[]');
    const index = items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${collection}`);
    }
    const deletedItem = items.splice(index, 1)[0];
    localStorage.setItem(dbKey, JSON.stringify(items));
    return deletedItem;
  }

  // Authentication - Firebase Register Integration
  async register(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const newUser = {
      id: firebaseUser.uid,
      name,
      email,
      role: email === 'admin@club.com' ? 'admin' : 'member',
      department: 'N/A',
      year: '1',
      position: 'Member',
      skills: [],
      linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
      github: 'https://github.com',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      verified: true
    };
    
    await this.insert('Users', newUser);
    return newUser;
  }

  // Authentication - Firebase Login Integration
  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    let userProfile = await this.findOne('Users', { id: firebaseUser.uid });
    if (!userProfile) {
      userProfile = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0],
        email: email,
        role: email === 'admin@club.com' ? 'admin' : 'member',
        department: 'N/A',
        year: '1',
        position: 'Member',
        skills: [],
        linkedin: 'https://linkedin.com/in/club-mindcraft-ai-95b2b8377/',
        github: 'https://github.com',
        photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        verified: true
      };
      await this.insert('Users', userProfile);
    }
    
    localStorage.setItem('aether_user_session', JSON.stringify(userProfile));
    localStorage.setItem('aether_jwt_token', `firebase.${btoa(JSON.stringify(userProfile))}.signature`);
    
    return { user: userProfile };
  }

  // Check Current Session Profile
  getCurrentUser() {
    const session = localStorage.getItem('aether_user_session');
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch(e) {
      return null;
    }
  }

  // End Session
  async logout() {
    await signOut(auth);
    localStorage.removeItem('aether_jwt_token');
    localStorage.removeItem('aether_user_session');
  }

  // Request Reset Email
  async forgotPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }
}

// Bind to window globally
window.db = new LocalDatabase();
