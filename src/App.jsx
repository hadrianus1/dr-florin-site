import React, { useState, useEffect } from "react";
import "./App.css";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaYoutube, FaTrash, FaCheck, FaReply, FaThumbsUp, FaThumbsDown, FaHeart } from "react-icons/fa";

function ReactionBar({ entityType, entity, userReactions, onReact }) {
  const reactions = [
    { type: 'like',   icon: <FaThumbsUp size={11} />,   activeColor: '#4fc3d9', activeBg: '#e0f7fb' },
    { type: 'heart',  icon: <FaHeart size={11} />,       activeColor: '#e53935', activeBg: '#fce4ec' },
    { type: 'unlike', icon: <FaThumbsDown size={11} />,  activeColor: '#fb8c00', activeBg: '#fff3e0' },
  ];
  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      {reactions.map(({ type, icon, activeColor, activeBg }) => {
        const active = userReactions.has(`${entityType}_${entity.id}_${type}`);
        const count = entity[type === 'unlike' ? 'unlikes' : type + 's'] || 0;
        return (
          <button
            key={type}
            onClick={() => onReact(entityType, entity.id, type)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 9px', border: 'none', borderRadius: '12px', cursor: 'pointer',
              fontSize: '12px', fontWeight: active ? '600' : '400',
              background: active ? activeBg : '#f0eeeb',
              color: active ? activeColor : '#999',
              transition: 'all 0.15s',
            }}
          >
            {icon} {count}
          </button>
        );
      })}
    </div>
  );
}

export default function SurgeonSite() {
  const [lang, setLang] = useState("ro");
  const [activeNav, setActiveNav] = useState("home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [adminToken, setAdminToken] = useState(null);
  const isAdmin = adminToken !== null;
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [commentLastPostTime, setCommentLastPostTime] = useState(0);

  // Q&A state
  const [questions, setQuestions] = useState([]);
  const [questionInput, setQuestionInput] = useState("");
  const [questionLastPostTime, setQuestionLastPostTime] = useState(0);
  const [replyInput, setReplyInput] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [commentUsername, setCommentUsername] = useState("");
  const [questionUsername, setQuestionUsername] = useState("");
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [fingerprint] = useState(() => {
    let fp = localStorage.getItem('reaction_fp');
    if (!fp) { fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('reaction_fp', fp); }
    return fp;
  });
  const [userReactions, setUserReactions] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('user_reactions') || '[]')); } catch { return new Set(); }
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/comments').then(r => r.json()).then(d => Array.isArray(d) && setComments(d)).catch(() => {});
    fetch('/api/questions').then(r => r.json()).then(d => Array.isArray(d) && setQuestions(d)).catch(() => {});
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('adminToken');
    if (!saved) return;
    fetch('/api/admin/verify', { headers: { Authorization: `Bearer ${saved}` } })
      .then(r => r.json())
      .then(d => { if (d.valid) setAdminToken(saved); else localStorage.removeItem('adminToken'); })
      .catch(() => localStorage.removeItem('adminToken'));
  }, []);

  const svgBase = window.location.href.replace(/#.*$/, '');
  const svgFill = (id) => `url(${svgBase}#${id})`;

  const liverIcon = (
    <svg width="44" height="44" viewBox="0 0 62 70" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="lv-main" cx="55%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="#e8604c"/>
          <stop offset="40%"  stopColor="#c43828"/>
          <stop offset="80%"  stopColor="#9c2418"/>
          <stop offset="100%" stopColor="#6c140e"/>
        </radialGradient>
        <radialGradient id="lv-left" cx="30%" cy="25%" r="65%">
          <stop offset="0%"   stopColor="#d04838"/>
          <stop offset="100%" stopColor="#801a10"/>
        </radialGradient>
        <radialGradient id="lv-gb" cx="38%" cy="28%" r="70%">
          <stop offset="0%"   stopColor="#7ade98"/>
          <stop offset="55%"  stopColor="#28a850"/>
          <stop offset="100%" stopColor="#166632"/>
        </radialGradient>
        <linearGradient id="lv-hl" x1="30%" y1="5%" x2="65%" y2="60%">
          <stop offset="0%"   stopColor="rgba(255,235,225,0.70)"/>
          <stop offset="100%" stopColor="rgba(255,200,190,0)"/>
        </linearGradient>
      </defs>
      <path
        d="M38,46 C42,44 52,47 54,56 C55,63 51,68 46,67 C41,67 37,63 38,57 C38,51 36,48 38,46Z"
        fill={svgFill('lv-gb')}
      />
      <ellipse cx="45" cy="56" rx="5" ry="3.5" fill="rgba(255,255,255,0.32)" transform="rotate(-20 45 56)"/>
      <path
        d="M5,26 C4,18 6,8 12,4 C16,1 20,2 23,10 C24,16 25,22 24,26 C25,20 30,6 38,3 C46,0 54,6 56,18 C58,28 56,40 48,46 C40,52 24,52 14,44 C8,38 4,30 5,26Z"
        fill={svgFill('lv-main')}
      />
      <path
        d="M5,26 C4,18 6,8 12,4 C16,1 20,2 22,10 C23,16 24,20 24,26 C18,30 10,32 8,38 C6,34 4,30 5,26Z"
        fill={svgFill('lv-left')} opacity="0.55"
      />
      <path
        d="M38,4 C46,1 54,7 56,18 C50,12 42,8 36,8 C34,8 35,5 38,4Z"
        fill={svgFill('lv-hl')}
      />
      <path
        d="M12,5 C16,2 21,4 23,10 C18,7 13,8 11,11 C10,9 11,6 12,5Z"
        fill="rgba(255,230,220,0.48)"
      />
      <path d="M32,24 C36,22 42,22 48,26" stroke="rgba(90,18,10,0.30)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M32,24 C30,30 30,38 32,44" stroke="rgba(90,18,10,0.30)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = lang === 'ro'
      ? 'Dr. Teodor-Florin Georgescu — Medic Primar Chirurgie Generală | MD, PhD'
      : 'Dr. Teodor-Florin Georgescu — Senior General Surgeon | MD, PhD';
  }, [lang]);

  const t = {
    ro: {
      name: "Dr. Teodor-Florin Georgescu",
      role: "Medic Primar Chirurgie Generală",
      title: "MD, PhD",
      motto: "Dedicare și excelență pentru fiecare pacient.",
      cta: "Programează consultație",
      
      nav: {
        home: "Acasă",
        about: "Despre mine",
        expertise: "Competență",
        experience: "Experiență",
        gallery: "Galerie",
        comments: "Comentarii",
        qa: "Q&A",
        contact: "Contact",
      },

      comments: {
        title: "Comentarii",
        placeholder: "Scrie un comentariu...",
        submit: "Trimite",
        pending: "În așteptare de aprobare",
        toggleAdmin: "Mod Admin",
        approve: "Aproba",
        delete: "Șterge",
      },

      qa: {
        title: "Întrebări și Răspunsuri",
        subtitle: "Pune o întrebare și primește răspuns de la Dr. Georgescu",
        placeholder: "Pune o întrebare...",
        submit: "Trimite Întrebarea",
        reply: "Răspunde",
        replyPlaceholder: "Scrie răspunsul...",
        pending: "În așteptare",
        replies: "răspunsuri",
      },

      about: {
        title: "Despre mine",
        subtitle: "O carieră dedicată chirurgiei moderne",
        intro: 'Mă numesc Dr. Teodor-Florin Georgescu și sunt medic primar în Chirurgie Generală și Asistent Universitar în cadrul Catedrei de Chirurgie Generală a Spitalului Clinic de Urgență București și UMF „Carol Davila”.',
        bio: "Cu o experiență de peste 12 ani în chirurgia minim invazivă, chirurgia oncologică și chirurgia de urgență, cu o gamă largă de patologii abordate, activitatea mea îmbină practica medicală de vârf cu implicarea academică și cercetarea științifică.",
      },

      credentials: {
        title: "Experiență & Educație",
        subtitle: "Un profil de referință în practica academică și clinică",
        items: [
          { year: "2014 – 2019", title: "Medic Rezident – Chirurgie Generală", institution: "Spitalul Clinic de Urgență București — Floreasca" },
          { year: "2016 – prezent", title: "Asistent Universitar", institution: 'Catedra de Chirurgie Generală, UMF „Carol Davila", București' },
          { year: "2020", title: "Doctor în Medicină (PhD)", institution: 'UMF „Carol Davila", București — teză privind diagnosticul molecular și prognosticul neoplasmelor rectale' },
          { year: "2020 – 2025", title: "Medic Specialist Chirurgie Generală", institution: "Spitalul Clinic de Urgență București — Floreasca" },
          { year: "din 2025", title: "Medic Primar Chirurgie Generală", institution: "Spitalul Clinic de Urgență București — Floreasca" },
        ],
        intl: "Formare profesională internațională (Heidelberg, Germania) și peste 25 de cursuri de perfecționare în chirurgia colorectală, chirurgia peretelui abdominal, urgențe chirurgicale, HPB, tehnici laparoscopice avansate.",
        academic: {
          title: "Activitate academică și de formare",
          intro: 'În calitate de cadru universitar UMF „Carol Davila", sunt implicat în:',
          items: [
            "Predarea cursurilor de chirurgie generală (anul IV și V) – module română și engleză",
            "Coordonarea lucrărilor de licență",
            "Organizarea workshopurilor practice pentru studenți și tineri medici («Elementary Skills in Laparoscopy», «Intestinal Anastomoses»)",
            "Participarea în comisii de examen (licență, rezidențiat, examene de specialitate și competențe)",
          ],
        },
        research: {
          title: "Cercetare științifică și publicații",
          intro: "Activitate științifică extinsă:",
          items: [
            "Peste 60 de prezentări la congrese naționale și internaționale",
            "Peste 25 de articole publicate în reviste indexate ISI/PubMed",
            "Participare în proiecte doctorale și postdoctorale privind cancerul colorectal, biologia tumorală, imunohistochimia și microbiota intestinală",
            "Colaborări în lucrări despre traumă, chirurgia pacienților diabetici, complicații ale anastomozelor, patologia pancreatică, rectală, colorectală și oncologică",
            "Contribuții la 4 volume academice și manuale de chirurgie",
          ],
        },
        conferences: {
          title: "Participare la congrese și premii",
          items: [
            "Participant activ la Congresele Naționale de Chirurgie",
            "Participare la conferințe internaționale (EAES, ECTES, IASGO)",
            "Premii pentru prezentări la conferințe și congrese (CNC 2015)",
          ],
        },
        philosophy: {
          title: "Filosofia mea profesională",
          subtitle: "Principii care ghidează practica mea medicală",
          items: [
            { title: "Diagnostic corect", desc: "Abordare personalizată, adaptată fiecărui pacient în parte" },
            { title: "Abord minim invaziv", desc: "Tehnici laparoscopice avansate ori de câte ori este posibil" },
            { title: "Siguranța pacientului", desc: "Reducerea complicațiilor și recuperare postoperatorie rapidă" },
            { title: "Colaborare multidisciplinară", desc: "Rezultate optime prin cooperare în echipă" },
            { title: "Învățare continuă", desc: "Integrarea cercetării și noilor tehnici în practica clinică" },
          ],
        },
      },

      expertise: {
        title: "Arii de competență",
        subtitle: "Specialități și intervenții chirurgicale de top",
        areas: [
          { name: "Chirurgie Oncologică", icon: "🔬", desc: [
            "Cancer de colon",
            "Cancer de rect",
            "Cancer gastric",
            "Cancer de sân",
            "Cancer esofagian",
            "Cancer hepato-biliar și pancreatic",
            "Neoplasme colorectale",
            "Urgențe colorectale",
            "Tehnici minim invazive oncologice",
            "Factori prognostici și tratamente multimodale",
          ]},
          { name: "Chirurgia Peretelui Abdominal", icon: "⚙️", desc: [
            "Hernie hiatală",
            "Hernie inghinală",
            "Hernie ombilicală",
            "Hernie epigastrică",
            "Hernie femurală",
            "Eventrație",
            "Abord deschis sau laparoscopic",
            "Materiale protetice moderne",
          ]},
          { name: "Chirurgia Hepato-Biliară și Pancreatică", icon: liverIcon, desc: [
            "Litiază veziculară",
            "Chist hidatic hepatic",
            "Tumori hepatice benigne",
            "Chisturi pancreatice",
            "Tumori pancreatice",
            "Pancreatită acută și cronică",
          ]},
          { name: "Chirurgie Proctologică", icon: "⚕️", desc: [
            "Hemoroizi",
            "Fisuri anale",
            "Abcese perianale",
            "Flegmoane ischiorectale",
            "Fistule perianale",
            "Chist / abces / fistule pilonidale",
          ]},
          { name: "Chirurgie Metabolică / Funcțională", icon: "⚡", desc: [
            "Chirurgie bariatrică (sleeve gastrectomy)",
            "Rezecții intestinale pentru malabsorbție",
          ]},
          { name: "Alte Intervenții", icon: "🏥", desc: [
            "Histerectomie",
            "Ovariectomie",
            "Chistectomii",
            "Evidare ganglionară interaortocavă",
            "Excizii tumorale",
            "Afecțiuni benigne ale tubului digestiv",
          ]},
        ],
      },

      contact: {
        title: "Contact",
        subtitle: "Programează-ți consultația astazi",
        phone: "+40 (0) 745 161 261",
        email: "florin.georgescu1@yahoo.com",
        hours: "Luni - Vineri: 8:00 - 18:00",
      },
    },

    en: {
      name: "Dr. Teodor-Florin Georgescu",
      role: "Senior General Surgeon",
      title: "MD, PhD",
      motto: "Dedication and excellence for every patient.",
      cta: "Book consultation",
      
      nav: {
        home: "Home",
        about: "About",
        expertise: "Expertise",
        experience: "Experience",
        gallery: "Gallery",
        comments: "Comments",
        qa: "Q&A",
        contact: "Contact",
      },

      comments: {
        title: "Comments",
        placeholder: "Write a comment...",
        submit: "Post",
        pending: "Pending approval",
        toggleAdmin: "Admin Mode",
        approve: "Approve",
        delete: "Delete",
      },

      qa: {
        title: "Questions & Answers",
        subtitle: "Ask a question and get a response from Dr. Georgescu",
        placeholder: "Ask a question...",
        submit: "Submit Question",
        reply: "Reply",
        replyPlaceholder: "Write a reply...",
        pending: "Pending",
        replies: "replies",
      },

      about: {
        title: "About Me",
        subtitle: "A career dedicated to modern surgery",
        intro: "I am Dr. Teodor-Florin Georgescu, Senior General Surgeon and University Assistant at the Department of General Surgery, Emergency Clinical Hospital Bucharest and UMF 'Carol Davila'.",
        bio: "With over 12 years of experience in minimally invasive surgery, oncological surgery, and emergency surgery, covering a wide range of pathologies, my practice combines cutting-edge clinical care with academic involvement and scientific research.",
      },

      credentials: {
        title: "Experience & Education",
        subtitle: "A reference profile in academic and clinical practice",
        items: [
          { year: "2014 – 2019", title: "Surgical Resident – General Surgery", institution: "Emergency Clinical Hospital Bucharest — Floreasca" },
          { year: "2016 – present", title: "University Assistant", institution: "Dept. of General Surgery, UMF 'Carol Davila', Bucharest" },
          { year: "2020", title: "Doctor of Medicine (PhD)", institution: "UMF 'Carol Davila', Bucharest — thesis on molecular diagnosis and prognosis of rectal neoplasms" },
          { year: "2020 – 2025", title: "General Surgery Specialist", institution: "Emergency Clinical Hospital Bucharest — Floreasca" },
          { year: "since 2025", title: "Senior General Surgeon (Medic Primar)", institution: "Emergency Clinical Hospital Bucharest — Floreasca" },
        ],
        intl: "International professional training (Heidelberg, Germany) and over 25 advanced courses in colorectal surgery, abdominal wall surgery, surgical emergencies, HPB, and advanced laparoscopic techniques.",
        academic: {
          title: "Academic & Training Activity",
          intro: "As a faculty member at UMF 'Carol Davila', I am involved in:",
          items: [
            "Teaching general surgery courses (4th and 5th year) – Romanian and English modules",
            "Supervising undergraduate dissertations",
            "Organising practical workshops for students and junior doctors ('Elementary Skills in Laparoscopy', 'Intestinal Anastomoses')",
            "Participation in examination committees (graduation, residency, specialty and competency exams)",
          ],
        },
        research: {
          title: "Scientific Research & Publications",
          intro: "Extensive scientific record:",
          items: [
            "Over 60 presentations at national and international congresses",
            "Over 25 articles published in ISI/PubMed-indexed journals",
            "Participation in doctoral and post-doctoral projects on colorectal cancer, tumour biology, immunohistochemistry, and intestinal microbiota",
            "Contributions to works on trauma, diabetic patients surgery, anastomotic complications, pancreatic, rectal, colorectal and oncological pathology",
            "Contributions to 4 academic volumes and surgical textbooks",
          ],
        },
        conferences: {
          title: "Congresses & Awards",
          items: [
            "Active participant at National Surgery Congresses",
            "Participation at international conferences (EAES, ECTES, IASGO)",
            "Awards for presentations at conferences and congresses (CNC 2015)",
          ],
        },
        philosophy: {
          title: "My Professional Philosophy",
          subtitle: "Principles guiding my medical practice",
          items: [
            { title: "Accurate Diagnosis", desc: "Personalised approach tailored to each individual patient" },
            { title: "Minimally Invasive", desc: "Advanced laparoscopic techniques whenever possible" },
            { title: "Patient Safety", desc: "Complication reduction and rapid postoperative recovery" },
            { title: "Multidisciplinary", desc: "Optimal outcomes through team collaboration" },
            { title: "Continuous Learning", desc: "Integrating research and new techniques into clinical practice" },
          ],
        },
      },

      expertise: {
        title: "Areas of Expertise",
        subtitle: "Specialized and cutting-edge surgical procedures",
        areas: [
          { name: "Oncological Surgery", icon: "🔬", desc: [
            "Colon cancer",
            "Rectal cancer",
            "Gastric cancer",
            "Breast cancer",
            "Oesophageal cancer",
            "Hepatobiliary and pancreatic cancer",
            "Colorectal neoplasms",
            "Colorectal emergencies",
            "Minimally invasive oncological techniques",
            "Prognostic factors and multimodal treatment",
          ]},
          { name: "Abdominal Wall Surgery", icon: "⚙️", desc: [
            "Hiatal hernia",
            "Inguinal hernia",
            "Umbilical hernia",
            "Epigastric hernia",
            "Femoral hernia",
            "Incisional hernia (eventration)",
            "Open and laparoscopic approach",
            "Modern prosthetic materials",
          ]},
          { name: "Hepato-Biliary & Pancreatic Surgery", icon: liverIcon, desc: [
            "Gallstone disease",
            "Hepatic hydatid cyst",
            "Benign liver tumours",
            "Pancreatic cysts",
            "Pancreatic tumours",
            "Acute and chronic pancreatitis",
          ]},
          { name: "Proctological Surgery", icon: "⚕️", desc: [
            "Haemorrhoids",
            "Anal fissures",
            "Perianal abscesses",
            "Ischiorectal cellulitis",
            "Perianal fistulas",
            "Pilonidal cyst / abscess / fistula",
          ]},
          { name: "Metabolic / Functional Surgery", icon: "⚡", desc: [
            "Bariatric surgery (sleeve gastrectomy)",
            "Intestinal resections for malabsorption",
          ]},
          { name: "Other Procedures", icon: "🏥", desc: [
            "Hysterectomy",
            "Oophorectomy",
            "Cystectomies",
            "Interaortocaval lymph node dissection",
            "Tumour excisions",
            "Benign gastrointestinal pathology",
          ]},
        ],
      },

      contact: {
        title: "Contact",
        subtitle: "Schedule your consultation today",
        phone: "+40 (0) 745 161 261",
        email: "florin.georgescu1@yahoo.com",
        hours: "Monday - Friday: 8:00 - 18:00",
      },
    },
  }[lang];

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString(lang === "ro" ? "ro-RO" : "en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const showToast = (message) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => setToast(t => t?.id === id ? null : t), 5000);
  };

  // Comments handlers
  const handleAddComment = async () => {
    const now = Date.now();
    if (now - commentLastPostTime < 10000) {
      showToast(lang === "ro" ? "Asteaptă înainte să postezi din nou" : "Please wait before posting again");
      return;
    }
    if (!commentUsername.trim()) {
      showToast(lang === "ro" ? "Numele este obligatoriu" : "Name is required");
      return;
    }
    if (!commentInput.trim()) return;

    const name = commentUsername.trim();
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, text: commentInput }),
      });
      if (response.ok) {
        const newComment = await response.json();
        setComments([newComment, ...comments]);
        setCommentInput("");
        setCommentUsername("");
        setCommentLastPostTime(now);
        showToast(lang === "ro" ? "Comentariu trimis!" : "Comment posted!");
        return;
      }
    } catch (_) {}
    // offline fallback
    setComments([{
      id: Date.now(),
      username: name,
      text: commentInput,
      approved: false,
      created_at: new Date().toISOString(),
    }, ...comments]);
    setCommentInput("");
    setCommentUsername("");
    setCommentLastPostTime(now);
    showToast(lang === "ro" ? "Comentariu trimis!" : "Comment posted!");
  };

  const handleAdminLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdminToken(data.token);
        localStorage.setItem('adminToken', data.token);
        setShowAdminLogin(false);
        setAdminPassword("");
        setAdminError("");
      } else {
        setAdminError(data.error || (lang === "ro" ? "Parolă incorectă" : "Incorrect password"));
      }
    } catch {
      setAdminError(lang === "ro" ? "Eroare de conexiune" : "Connection error");
    }
  };

  const handleAdminLogout = () => {
    setAdminToken(null);
    localStorage.removeItem('adminToken');
  };

  const authHeader = () => ({ Authorization: `Bearer ${adminToken}` });

  const approveComment = async (id) => {
    try {
      const res = await fetch(`/api/comments/${id}/approve`, { method: "PATCH", headers: authHeader() });
      if (res.status === 401) { handleAdminLogout(); return; }
    } catch (_) {}
    setComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
  };

  const deleteComment = async (id) => {
    if (!window.confirm(lang === "ro" ? "Ești sigur că vrei să ștergi acest comentariu?" : "Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE", headers: authHeader() });
      if (res.status === 401) { handleAdminLogout(); return; }
    } catch (_) {}
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleReact = async (entityType, entityId, reactionType) => {
    const key = `${entityType}_${entityId}_${reactionType}`;
    const isAdding = !userReactions.has(key);
    const countKey = reactionType === 'unlike' ? 'unlikes' : reactionType + 's';
    const delta = isAdding ? 1 : -1;

    // Optimistic update — works immediately regardless of DB state
    const next = new Set(userReactions);
    isAdding ? next.add(key) : next.delete(key);
    setUserReactions(next);
    localStorage.setItem('user_reactions', JSON.stringify([...next]));
    const applyDelta = (e) => ({ ...e, [countKey]: Math.max(0, (e[countKey] || 0) + delta) });
    if (entityType === 'comment') {
      setComments(prev => prev.map(c => c.id === entityId ? applyDelta(c) : c));
    } else if (entityType === 'question') {
      setQuestions(prev => prev.map(q => q.id === entityId ? applyDelta(q) : q));
    } else {
      setQuestions(prev => prev.map(q => ({ ...q, replies: q.replies.map(r => r.id === entityId ? applyDelta(r) : r) })));
    }

    // Best-effort server sync — if DB is up, reconcile counts
    try {
      const res = await fetch('/api/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity_type: entityType, entity_id: entityId, reaction_type: reactionType, fingerprint }),
      });
      if (res.ok) {
        const data = await res.json();
        const patch = { likes: data.likes, hearts: data.hearts, unlikes: data.unlikes };
        if (entityType === 'comment') setComments(prev => prev.map(c => c.id === entityId ? { ...c, ...patch } : c));
        else if (entityType === 'question') setQuestions(prev => prev.map(q => q.id === entityId ? { ...q, ...patch } : q));
        else setQuestions(prev => prev.map(q => ({ ...q, replies: q.replies.map(r => r.id === entityId ? { ...r, ...patch } : r) })));
      }
    } catch (_) {}
  };

  // Q&A handlers
  const handleAddQuestion = async () => {
    const now = Date.now();
    if (now - questionLastPostTime < 10000) {
      showToast(lang === "ro" ? "Asteaptă înainte să postezi din nou" : "Please wait before posting again");
      return;
    }
    if (!questionUsername.trim()) {
      showToast(lang === "ro" ? "Numele este obligatoriu" : "Name is required");
      return;
    }
    if (!questionInput.trim()) return;

    const name = questionUsername.trim();
    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, text: questionInput }),
      });
      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions([newQuestion, ...questions]);
        setQuestionInput("");
        setQuestionUsername("");
        setQuestionLastPostTime(now);
        showToast(lang === "ro" ? "Întrebare trimisă!" : "Question posted!");
        return;
      }
    } catch (_) {}
    // offline fallback
    setQuestions([{
      id: Date.now(),
      username: name,
      text: questionInput,
      approved: false,
      created_at: new Date().toISOString(),
      replies: [],
    }, ...questions]);
    setQuestionInput("");
    setQuestionUsername("");
    setQuestionLastPostTime(now);
    showToast(lang === "ro" ? "Întrebare trimisă!" : "Question posted!");
  };

  const handleAddReply = async (questionId) => {
    const reply = replyInput[questionId];
    if (!reply || !reply.trim()) return;

    try {
      const response = await fetch(`/api/questions/${questionId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ username: "Dr. Georgescu", text: reply }),
      });
      if (response.ok) {
        const newReply = await response.json();
        setQuestions(questions.map(q =>
          q.id === questionId ? { ...q, replies: [...q.replies, newReply] } : q
        ));
        setReplyInput({ ...replyInput, [questionId]: "" });
        showToast(lang === "ro" ? "Răspuns trimis!" : "Reply posted!");
        return;
      }
    } catch (_) {}
    // offline fallback
    setQuestions(questions.map(q =>
      q.id === questionId
        ? { ...q, replies: [...q.replies, {
            id: Date.now(),
            username: "Dr. Georgescu",
            text: reply,
            approved: false,
            created_at: new Date().toISOString(),
          }] }
        : q
    ));
    setReplyInput({ ...replyInput, [questionId]: "" });
    showToast(lang === "ro" ? "Răspuns trimis!" : "Reply posted!");
  };

  const approveReply = async (questionId, replyId) => {
    try {
      const res = await fetch(`/api/questions/${questionId}/replies/${replyId}/approve`, { method: "PATCH", headers: authHeader() });
      if (res.status === 401) { handleAdminLogout(); return; }
    } catch (_) {}
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, replies: q.replies.map(r => r.id === replyId ? { ...r, approved: true } : r) } : q
    ));
  };

  const deleteReply = async (questionId, replyId) => {
    if (!window.confirm(lang === "ro" ? "Ești sigur că vrei să ștergi acest răspuns?" : "Are you sure you want to delete this reply?")) return;
    try {
      const res = await fetch(`/api/questions/${questionId}/replies/${replyId}`, { method: "DELETE", headers: authHeader() });
      if (res.status === 401) { handleAdminLogout(); return; }
    } catch (_) {}
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, replies: q.replies.filter(r => r.id !== replyId) } : q
    ));
  };

  const approveQuestion = async (id) => {
    try {
      const res = await fetch(`/api/questions/${id}/approve`, { method: "PATCH", headers: authHeader() });
      if (res.status === 401) { handleAdminLogout(); return; }
    } catch (_) {}
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, approved: true } : q));
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm(lang === "ro" ? "Ești sigur că vrei să ștergi această întrebare și toate răspunsurile ei?" : "Are you sure you want to delete this question and all its replies?")) return;
    try {
      const res = await fetch(`/api/questions/${id}`, { method: "DELETE", headers: authHeader() });
      if (res.status === 401) { handleAdminLogout(); return; }
    } catch (_) {}
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const iconStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#4fc3d9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1a1a1a",
    transition: "all 0.3s",
    textDecoration: "none",
  };

  return (
    <div style={{ fontFamily: "'Lora', 'Georgia', serif", color: "#2c2c2c", background: "#fafaf8" }}>
      {/* ===== HEADER ===== */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: isScrolled ? "rgba(250, 250, 248, 0.95)" : "rgba(250, 250, 248, 0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: isScrolled ? "1px solid #e0dcd5" : "none",
          transition: "all 0.3s ease",
          height: "70px",
        }}
      >
        <div className="header-inner" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="#home" onClick={() => setActiveNav("home")} style={{ flexShrink: 0, display: "block", lineHeight: 0 }}>
            <img src="/Florin_3.jpeg" style={{ height: "54px", width: "auto", display: "block", borderRadius: "2px", cursor: "pointer" }} alt="Dr. Georgescu" />
          </a>

          <nav style={{ display: "flex", gap: "35px", listStyle: "none" }} className="desktop-nav">
            {["home", "about", "expertise", "experience", "gallery", "comments", "qa", "contact"].map((section) => (
              <a
                key={section}
                href={`#${section}`}
                onClick={() => setActiveNav(section)}
                style={{
                  textDecoration: "none",
                  color: activeNav === section ? "#4fc3d9" : "#2c2c2c",
                  fontSize: "13px",
                  fontWeight: "500",
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                  transition: "color 0.3s ease",
                  borderBottom: activeNav === section ? "2px solid #4fc3d9" : "2px solid transparent",
                  paddingBottom: "2px",
                }}
                onMouseEnter={(e) => { e.target.style.color = "#4fc3d9"; }}
                onMouseLeave={(e) => { if (activeNav !== section) e.target.style.color = "#2c2c2c"; }}
              >
                {t.nav[section]}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {isAdmin && (
              <button
                onClick={handleAdminLogout}
                style={{ background: "#e53935", color: "white", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px", textTransform: "uppercase" }}
              >
                {lang === "ro" ? "Ieși Admin" : "Logout Admin"}
              </button>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setLang("ro")} style={{ background: "none", border: "none", fontSize: "12px", fontWeight: lang === "ro" ? "700" : "400", color: lang === "ro" ? "#4fc3d9" : "#999", cursor: "pointer", transition: "color 0.3s", textTransform: "uppercase" }}>RO</button>
              <span style={{ color: "#ddd" }}>|</span>
              <button onClick={() => setLang("en")} style={{ background: "none", border: "none", fontSize: "12px", fontWeight: lang === "en" ? "700" : "400", color: lang === "en" ? "#4fc3d9" : "#999", cursor: "pointer", transition: "color 0.3s", textTransform: "uppercase" }}>EN</button>
            </div>
            <button className={`hamburger-btn${menuOpen ? " open" : ""}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobile nav overlay */}
        <div className={`mobile-nav-overlay${menuOpen ? " open" : ""}`}>
          {["home", "about", "expertise", "experience", "gallery", "comments", "qa", "contact"].map((section) => (
            <a
              key={section}
              href={`#${section}`}
              className={activeNav === section ? "active" : ""}
              onClick={() => { setActiveNav(section); setMenuOpen(false); }}
            >
              {t.nav[section]}
            </a>
          ))}
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section id="home" className="hero-section" style={{ height: "100vh", display: "flex", alignItems: "center", background: "linear-gradient(135deg, #fafaf8 0%, #f5f3f0 100%)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(79, 195, 217, 0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div className="hero-inner" style={{ display: "flex", width: "100%", maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 2, alignSelf: "stretch" }}>
          <div className="hero-text" style={{ flex: 1, padding: "80px 60px 80px 80px", display: "flex", flexDirection: "column", justifyContent: "center", animation: "fadeInUp 0.8s ease 0.2s both" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "20px" }}>
              {lang === "ro" ? "Chirurgie Generală de top" : "CUTTING-EDGE GENERAL SURGERY"}
            </div>

            <h1 style={{ fontSize: "56px", fontWeight: "400", lineHeight: "1.1", marginBottom: "12px", color: "#1a1a1a" }}>
              {t.name}
            </h1>

            <p style={{ fontSize: "18px", color: "#666", fontWeight: "400", marginBottom: "10px", letterSpacing: "0.5px" }}>
              {t.role}, {t.title}
            </p>

            <p style={{ fontSize: "16px", color: "#888", fontStyle: "italic", marginTop: "24px", marginBottom: "40px", maxWidth: "500px", lineHeight: "1.6" }}>
              "{t.motto}"
            </p>

            {/* CENTERED CTA BUTTON */}
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <a
                href="https://wa.me/40745161261"
                style={{
                  display: "inline-block",
                  background: "#1a1a1a",
                  color: "white",
                  padding: "16px 40px",
                  fontSize: "13px",
                  fontWeight: "600",
                  textDecoration: "none",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  borderRadius: "0",
                  transition: "all 0.3s ease",
                  border: "2px solid #1a1a1a",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#1a1a1a"; }}
                onMouseLeave={(e) => { e.target.style.background = "#1a1a1a"; e.target.style.color = "white"; }}
              >
                {t.cta} →
              </a>
            </div>
          </div>

          <div className="hero-img" style={{ flex: "0 0 45%", height: "100%", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #fafaf8 0%, #f5f3f0 100%)", animation: "fadeInScale 0.8s ease 0.4s both" }}>
            <img src="/Florin_1.jpeg" alt={t.name} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom" }} />
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className="section-pad" style={{ padding: "100px 40px", background: "white" }}>
        <div className="about-inner" style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", gap: "80px", alignItems: "center" }}>
        <div className="about-photo" style={{ flex: 1, overflow: "hidden" }}>
          <img src="/Florin_3.jpeg" alt="About" style={{ width: "100%", height: "auto", borderRadius: "2px", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "16px" }}>
            {lang === "ro" ? "Experiență și Devotament" : "Experience & Dedication"}
          </div>
          <h2 className="section-title" style={{ fontSize: "42px", fontWeight: "400", marginBottom: "28px", color: "#1a1a1a", lineHeight: "1.2" }}>
            {t.about.title}
          </h2>
          <p style={{ fontSize: "15px", lineHeight: "1.8", color: "#666", marginBottom: "20px" }}>
            {t.about.intro}
          </p>
          <p style={{ fontSize: "15px", lineHeight: "1.8", color: "#666", marginBottom: "32px" }}>
            {t.about.bio}
          </p>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              { label: lang === "ro" ? "Ani de experiență" : "Years of experience", value: "12+" },
              { label: lang === "ro" ? "Pacienți tratați" : "Patients treated", value: "1000+" },
              { label: lang === "ro" ? "Prezentări la congrese" : "Congress presentations", value: "60+" },
              { label: lang === "ro" ? "Publicații ISI/PubMed" : "ISI/PubMed publications", value: "25+" },
            ].map((stat, i) => (
              <div key={i} style={{ background: "#fafaf8", padding: "16px 20px", borderRadius: "2px", borderLeft: "3px solid #4fc3d9" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "22px", fontWeight: "600", color: "#1a1a1a" }}>{stat.value}</p>
                <p style={{ margin: "0", fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Video links */}
          <div style={{ marginTop: "36px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "16px" }}>
              {lang === "ro" ? "Urmărește-mă în acțiune" : "Watch me in action"}
            </p>
            <div className="video-links" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {[
                {
                  icon: <FaFacebook size={20} />,
                  label: "Facebook",
                  desc: lang === "ro" ? "Reels chirurgicale" : "Surgical reels",
                  color: "#1877F2",
                  href: "https://www.facebook.com/reel/2609000602602871",
                },
                {
                  icon: <FaYoutube size={20} />,
                  label: "YouTube",
                  desc: lang === "ro" ? "Videoclipuri medicale" : "Medical videos",
                  color: "#FF0000",
                  href: "https://www.youtube.com/watch?v=ChPWAfMVQoU",
                },
                {
                  icon: <FaTiktok size={20} />,
                  label: "TikTok",
                  desc: lang === "ro" ? "Educație medicală" : "Medical education",
                  color: "#010101",
                  href: "https://www.tiktok.com/@dr.florin.georgescu/video/7609283504836447490",
                },
              ].map((v, i) => (
                <a
                  key={i}
                  href={v.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "12px 18px",
                    background: "#fafaf8",
                    borderRadius: "2px",
                    borderLeft: `3px solid ${v.color}`,
                    textDecoration: "none",
                    color: "#1a1a1a",
                    transition: "box-shadow 0.2s",
                    flex: "1 1 140px",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
                >
                  <span style={{ color: v.color }}>{v.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600" }}>{v.label}</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{v.desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ===== EXPERTISE ===== */}
      <section id="expertise" className="section-pad" style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <h2 className="section-title" style={{ fontSize: "42px", fontWeight: "400", marginBottom: "16px", color: "#1a1a1a" }}>
            {t.expertise.title}
          </h2>
          <p style={{ fontSize: "16px", color: "#888", maxWidth: "600px", margin: "0 auto" }}>
            {t.expertise.subtitle}
          </p>
        </div>
        <div className="expertise-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px" }}>
          {t.expertise.areas.map((area, i) => (
            <div key={i} className="expertise-card" style={{ background: "#fafaf8", padding: "40px 32px", borderRadius: "2px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transition: "all 0.3s ease", cursor: "pointer" }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{area.icon}</div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1a1a1a", marginBottom: "12px" }}>
                {area.name}
              </h3>
              <ul style={{ margin: "0", paddingLeft: "16px" }}>
                {area.desc.map((item, j) => (
                  <li key={j} style={{ fontSize: "13px", color: "#666", lineHeight: "1.7", marginBottom: "2px" }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ===== EXPERIENCE ===== */}
      <section id="experience" className="section-pad" style={{ padding: "100px 40px", background: "#fafaf8" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          {/* Section heading */}
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", letterSpacing: "2px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "16px" }}>
              {lang === "ro" ? "Parcurs Medical" : "Medical Journey"}
            </div>
            <h2 className="section-title" style={{ fontSize: "42px", fontWeight: "400", marginBottom: "16px", color: "#1a1a1a" }}>
              {t.credentials.title}
            </h2>
            <p style={{ fontSize: "16px", color: "#888", maxWidth: "600px", margin: "0 auto" }}>
              {t.credentials.subtitle}
            </p>
          </div>

          {/* Timeline */}
          <div style={{ position: "relative", maxWidth: "700px", margin: "0 auto 60px" }}>
            <div className="timeline-line" style={{ position: "absolute", left: "130px", top: 0, bottom: 0, width: "1px", background: "#e0dcd5" }} />
            {t.credentials.items.map((item, i) => (
              <div key={i} style={{ display: "flex", marginBottom: "36px", position: "relative", alignItems: "flex-start" }}>
                <div className="timeline-year" style={{ width: "130px", flexShrink: 0, paddingRight: "28px", textAlign: "right" }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#4fc3d9", letterSpacing: "0.3px", lineHeight: "1.6" }}>{item.year}</span>
                </div>
                <div className="timeline-dot" style={{ position: "absolute", left: "126px", top: "5px", width: "9px", height: "9px", borderRadius: "50%", background: "#4fc3d9" }} />
                <div className="timeline-content" style={{ paddingLeft: "36px" }}>
                  <p style={{ margin: "0 0 4px 0", fontWeight: "600", fontSize: "15px", color: "#1a1a1a", lineHeight: "1.4" }}>{item.title}</p>
                  <p style={{ margin: "0", fontSize: "13px", color: "#888" }}>{item.institution}</p>
                </div>
              </div>
            ))}
          </div>

          {/* International training */}
          <div style={{ background: "white", borderLeft: "3px solid #4fc3d9", padding: "16px 24px", marginBottom: "80px", borderRadius: "0 2px 2px 0", maxWidth: "700px", margin: "0 auto 80px" }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#666", lineHeight: "1.7", fontStyle: "italic" }}>{t.credentials.intl}</p>
          </div>

          {/* Academic + Research — two columns */}
          <div className="exp-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "60px" }}>
            <div style={{ background: "white", padding: "32px", borderRadius: "2px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "6px", paddingBottom: "12px", borderBottom: "2px solid #4fc3d9" }}>{t.credentials.academic.title}</h3>
              <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "16px", marginTop: "10px" }}>{t.credentials.academic.intro}</p>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {t.credentials.academic.items.map((item, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#666", lineHeight: "1.7", marginBottom: "8px" }}>{item}</li>
                ))}
              </ul>
            </div>
            <div style={{ background: "white", padding: "32px", borderRadius: "2px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "6px", paddingBottom: "12px", borderBottom: "2px solid #4fc3d9" }}>{t.credentials.research.title}</h3>
              <p style={{ fontSize: "13px", color: "#aaa", marginBottom: "16px", marginTop: "10px" }}>{t.credentials.research.intro}</p>
              <ul style={{ margin: 0, padding: "0 0 0 18px" }}>
                {t.credentials.research.items.map((item, i) => (
                  <li key={i} style={{ fontSize: "14px", color: "#666", lineHeight: "1.7", marginBottom: "8px" }}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conferences */}
          <div style={{ background: "white", padding: "32px", borderRadius: "2px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", marginBottom: "80px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a", marginBottom: "20px", paddingBottom: "12px", borderBottom: "2px solid #4fc3d9" }}>{t.credentials.conferences.title}</h3>
            <ul className="conf-list" style={{ margin: 0, padding: "0 0 0 18px", columns: 2 }}>
              {t.credentials.conferences.items.map((item, i) => (
                <li key={i} style={{ fontSize: "14px", color: "#666", lineHeight: "1.7", marginBottom: "8px", breakInside: "avoid" }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Professional Philosophy */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h3 style={{ fontSize: "32px", fontWeight: "400", marginBottom: "12px", color: "#1a1a1a" }}>{t.credentials.philosophy.title}</h3>
            <p style={{ fontSize: "15px", color: "#888" }}>{t.credentials.philosophy.subtitle}</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "24px" }}>
            {t.credentials.philosophy.items.map((item, i) => (
              <div key={i} style={{ background: "white", padding: "28px 20px", borderRadius: "2px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", textAlign: "center", transition: "all 0.3s ease" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#4fc3d9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#1a1a1a", fontWeight: "700", fontSize: "16px" }}>{i + 1}</div>
                <p style={{ margin: "0 0 8px 0", fontWeight: "600", fontSize: "14px", color: "#1a1a1a" }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#888", lineHeight: "1.5" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section id="gallery" className="section-pad" style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <h2 className="section-title" style={{ fontSize: "42px", fontWeight: "400", marginBottom: "16px", color: "#1a1a1a" }}>
              {lang === "ro" ? "Galerie - În Sala de Operație" : "Gallery - In the Operating Room"}
            </h2>
          </div>
          <div className="gallery-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "28px" }}>
            <div style={{ overflow: "hidden", borderRadius: "2px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", aspectRatio: "16/10" }}>
              <img src="/Florin_2.jpeg" alt="Operating room" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMMENTS ===== */}
      <section id="comments" className="section-pad" style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 className="section-title" style={{ fontSize: "42px", fontWeight: "400", marginBottom: "16px", color: "#1a1a1a" }}>
            {t.comments.title}
          </h2>

          <div style={{ marginBottom: "40px" }}>
            <input
              type="text"
              value={commentUsername}
              onChange={(e) => setCommentUsername(e.target.value)}
              placeholder={lang === "ro" ? "Numele tău *" : "Your name *"}
              className="mobile-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                marginBottom: "8px",
                borderRadius: "4px",
                border: "1px solid #e0dcd5",
                fontFamily: "inherit",
                fontSize: "15px",
              }}
            />
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder={t.comments.placeholder}
              className="mobile-input"
              style={{
                width: "100%",
                padding: "12px",
                minHeight: "80px",
                borderRadius: "4px",
                border: "1px solid #e0dcd5",
                fontFamily: "inherit",
                fontSize: "15px",
                resize: "vertical",
              }}
            />
            <button
              onClick={handleAddComment}
              style={{
                marginTop: "12px",
                background: "#4fc3d9",
                color: "#1a1a1a",
                padding: "10px 24px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              {t.comments.submit}
            </button>
          </div>

          {comments
            .filter(c => c.approved || isAdmin)
            .map(c => (
              <div
                key={c.id}
                style={{
                  borderBottom: "1px solid #e0dcd5",
                  padding: "20px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600", color: "#4fc3d9" }}>
                    {c.username || "Anonymous"}
                  </p>
                  <p style={{ margin: "0 0 8px 0", color: "#2c2c2c" }}>{c.text}</p>
                  <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#999" }}>
                    {formatDate(c.created_at)} {!c.approved && ` • ${t.comments.pending}`}
                  </p>
                  {c.approved && <ReactionBar entityType="comment" entity={c} userReactions={userReactions} onReact={handleReact} />}
                </div>
                {isAdmin && (
                  <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
                    {!c.approved && (
                      <button
                        onClick={() => approveComment(c.id)}
                        style={{
                          background: "#4fc3d9",
                          color: "#1a1a1a",
                          border: "none",
                          padding: "6px 12px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FaCheck size={12} /> {t.comments.approve}
                      </button>
                    )}
                    <button
                      onClick={() => deleteComment(c.id)}
                      style={{
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        cursor: "pointer",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FaTrash size={12} /> {t.comments.delete}
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* ===== Q&A ===== */}
      <section id="qa" className="section-pad" style={{ padding: "100px 40px", background: "#fafaf8" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 className="section-title" style={{ fontSize: "42px", fontWeight: "400", marginBottom: "8px", color: "#1a1a1a" }}>
            {t.qa.title}
          </h2>
          <p style={{ fontSize: "16px", color: "#888", marginBottom: "40px" }}>
            {t.qa.subtitle}
          </p>

          <div style={{ marginBottom: "40px" }}>
            <input
              type="text"
              value={questionUsername}
              onChange={(e) => setQuestionUsername(e.target.value)}
              placeholder={lang === "ro" ? "Numele tău *" : "Your name *"}
              className="mobile-input"
              style={{
                width: "100%",
                padding: "10px 12px",
                marginBottom: "8px",
                borderRadius: "4px",
                border: "1px solid #e0dcd5",
                fontFamily: "inherit",
                fontSize: "15px",
              }}
            />
            <textarea
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder={t.qa.placeholder}
              className="mobile-input"
              style={{
                width: "100%",
                padding: "12px",
                minHeight: "80px",
                borderRadius: "4px",
                border: "1px solid #e0dcd5",
                fontFamily: "inherit",
                fontSize: "15px",
                resize: "vertical",
              }}
            />
            <button
              onClick={handleAddQuestion}
              style={{
                marginTop: "12px",
                background: "#4fc3d9",
                color: "#1a1a1a",
                padding: "10px 24px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              {t.qa.submit}
            </button>
          </div>

          {questions
            .filter(q => q.approved || isAdmin)
            .map(q => (
              <div
                key={q.id}
                style={{
                  background: "white",
                  borderRadius: "4px",
                  padding: "20px",
                  marginBottom: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600", color: "#4fc3d9" }}>
                      {q.username || "Anonymous"}
                    </p>
                    <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#1a1a1a" }}>
                      {q.text}
                    </p>
                    <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#999" }}>
                      {formatDate(q.created_at)} {!q.approved && ` • ${t.qa.pending}`} • {q.replies.filter(r => r.approved || isAdmin).length} {t.qa.replies}
                    </p>
                    {q.approved && (
                      <div onClick={e => e.stopPropagation()}>
                        <ReactionBar entityType="question" entity={q} userReactions={userReactions} onReact={handleReact} />
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
                      {!q.approved && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            approveQuestion(q.id);
                          }}
                          style={{
                            background: "#4fc3d9",
                            color: "#1a1a1a",
                            border: "none",
                            padding: "6px 12px",
                            cursor: "pointer",
                            borderRadius: "4px",
                          }}
                        >
                          <FaCheck size={12} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(q.id);
                        }}
                        style={{
                          background: "#f44336",
                          color: "white",
                          border: "none",
                          padding: "6px 12px",
                          cursor: "pointer",
                          borderRadius: "4px",
                        }}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {expandedQuestion === q.id && (
                  <div style={{ marginTop: "20px", borderTop: "1px solid #e0dcd5", paddingTop: "20px" }}>
                    {/* Replies */}
                    {q.replies
                      .filter(r => r.approved || isAdmin)
                      .map(r => (
                        <div
                          key={r.id}
                          style={{
                            background: "#fafaf8",
                            padding: "12px",
                            borderRadius: "4px",
                            marginBottom: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "600", color: "#4fc3d9" }}>
                              {r.username || "Dr. Georgescu"}
                            </p>
                            <p style={{ margin: "0 0 6px 0", color: "#2c2c2c" }}>{r.text}</p>
                            <p style={{ margin: "0 0 8px 0", fontSize: "12px", color: "#999" }}>
                              {formatDate(r.created_at)} {!r.approved && ` • ${t.qa.pending}`}
                            </p>
                            {r.approved && <ReactionBar entityType="reply" entity={r} userReactions={userReactions} onReact={handleReact} />}
                          </div>
                          {isAdmin && (
                            <div style={{ display: "flex", gap: "8px", marginLeft: "12px" }}>
                              {!r.approved && (
                                <button
                                  onClick={() => approveReply(q.id, r.id)}
                                  style={{
                                    background: "#4fc3d9",
                                    color: "#1a1a1a",
                                    border: "none",
                                    padding: "4px 8px",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                  }}
                                >
                                  <FaCheck size={10} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteReply(q.id, r.id)}
                                style={{
                                  background: "#f44336",
                                  color: "white",
                                  border: "none",
                                  padding: "4px 8px",
                                  cursor: "pointer",
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                }}
                              >
                                <FaTrash size={10} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                    {/* Reply input */}
                    <div style={{ marginTop: "12px" }}>
                      <textarea
                        value={replyInput[q.id] || ""}
                        onChange={(e) => setReplyInput({ ...replyInput, [q.id]: e.target.value })}
                        placeholder={t.qa.replyPlaceholder}
                        className="mobile-input"
                        style={{
                          width: "100%",
                          padding: "8px",
                          minHeight: "60px",
                          borderRadius: "4px",
                          border: "1px solid #e0dcd5",
                          fontFamily: "inherit",
                          fontSize: "15px",
                          resize: "vertical",
                        }}
                      />
                      <button
                        onClick={() => handleAddReply(q.id)}
                        style={{
                          marginTop: "8px",
                          background: "#4fc3d9",
                          color: "#1a1a1a",
                          padding: "8px 16px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <FaReply size={12} /> {t.qa.reply}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className="section-pad" style={{ padding: "100px 40px", background: "#1a1a1a", color: "white", textAlign: "center" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "42px", fontWeight: "400", marginBottom: "16px", color: "white" }}>
            {t.contact.title}
          </h2>
          <p style={{ fontSize: "16px", color: "#aaa", marginBottom: "60px" }}>
            {t.contact.subtitle}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "40px", marginBottom: "60px" }}>
            <div>
              <div style={{ fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "8px", fontWeight: "600" }}>
                {lang === "ro" ? "Telefon" : "Phone"}
              </div>
              <a href="tel:+40745161261" style={{ fontSize: "16px", color: "white", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => { e.target.style.color = "#4fc3d9"; }} onMouseLeave={(e) => { e.target.style.color = "white"; }}>
                {t.contact.phone}
              </a>
            </div>

            <div>
              <div style={{ fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "8px", fontWeight: "600" }}>
                {lang === "ro" ? "Email" : "Email"}
              </div>
              <a href="mailto:florin.georgescu1@yahoo.com" style={{ fontSize: "16px", color: "white", textDecoration: "none", transition: "color 0.3s" }} onMouseEnter={(e) => { e.target.style.color = "#4fc3d9"; }} onMouseLeave={(e) => { e.target.style.color = "white"; }}>
                {t.contact.email}
              </a>
            </div>

            <div>
              <div style={{ fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", color: "#4fc3d9", marginBottom: "8px", fontWeight: "600" }}>
                {lang === "ro" ? "Program" : "Hours"}
              </div>
              <p style={{ fontSize: "14px", color: "#aaa", margin: "0" }}>
                {t.contact.hours}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "40px" }}>
            <a href="https://wa.me/40745161261" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <FaWhatsapp size={22} />
            </a>
            <a href="https://www.instagram.com/dr.florin.georgescu" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <FaInstagram size={22} />
            </a>
            <a href="https://www.facebook.com/teddy.georgescu" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <FaFacebook size={22} />
            </a>
            <a href="https://www.tiktok.com/@dr.florin.georgescu" target="_blank" rel="noopener noreferrer" style={iconStyle}>
              <FaTiktok size={22} />
            </a>
          </div>

          <p
            onClick={() => !isAdmin && setShowAdminLogin(true)}
            style={{ fontSize: "12px", color: "#666", borderTop: "1px solid #333", paddingTop: "20px", margin: "0", userSelect: "none" }}
          >
            © 2026 Dr. Teodor-Florin Georgescu. {lang === "ro" ? "Toate drepturile rezervate." : "All rights reserved."}
          </p>
        </div>
      </section>

      {/* ===== FLOATING WHATSAPP ===== */}
      <a
        href="https://wa.me/40745161261"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          background: "#25d366",
          color: "white",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          fontSize: "24px",
          boxShadow: "0 4px 20px rgba(37, 211, 102, 0.4)",
          zIndex: 50,
          transition: "all 0.3s ease",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.target.style.transform = "scale(1.1)"; e.target.style.boxShadow = "0 8px 28px rgba(37, 211, 102, 0.6)"; }}
        onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 20px rgba(37, 211, 102, 0.4)"; }}
        title="WhatsApp"
      >
        💬
      </a>

      {toast && (
        <div key={toast.id} style={{
          position: "fixed", bottom: "104px", right: "28px", zIndex: 200,
          background: "#1a1a1a", color: "white",
          padding: "14px 18px 10px", borderRadius: "6px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
          minWidth: "200px", maxWidth: "280px",
        }}>
          <p style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: "500", letterSpacing: "0.2px" }}>
            {toast.message}
          </p>
          <div style={{ height: "3px", background: "#333", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", animation: "toastProgress 5s linear forwards" }} />
          </div>
        </div>
      )}

      {showAdminLogin && (
        <div
          onClick={() => { setShowAdminLogin(false); setAdminPassword(""); setAdminError(""); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "white", padding: "40px", borderRadius: "4px", width: "340px", boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}
          >
            <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>
              {lang === "ro" ? "Autentificare Admin" : "Admin Login"}
            </h3>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
              placeholder={lang === "ro" ? "Parolă" : "Password"}
              autoFocus
              style={{ width: "100%", padding: "10px 12px", marginBottom: "12px", border: "1px solid #e0dcd5", borderRadius: "4px", fontFamily: "inherit", fontSize: "14px", boxSizing: "border-box" }}
            />
            {adminError && (
              <p style={{ margin: "0 0 12px 0", fontSize: "13px", color: "#e53935" }}>{adminError}</p>
            )}
            <button
              onClick={handleAdminLogin}
              style={{ width: "100%", background: "#1a1a1a", color: "white", border: "none", padding: "12px", borderRadius: "4px", cursor: "pointer", fontWeight: "600", fontSize: "14px", fontFamily: "inherit" }}
            >
              {lang === "ro" ? "Intră" : "Login"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastProgress {
          0%   { width: 100%; background: #4fc3d9; }
          60%  { background: #f59e0b; }
          100% { width: 0%;   background: #ef4444; }
        }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @media (max-width: 768px) {
          header { padding: 0 20px; }
          .desktop-nav { display: none !important; }
          h1 { font-size: 36px !important; }
          h2 { font-size: 28px !important; }
          section { padding: 60px 20px !important; }
          section[style*="display: flex"] { flex-direction: column !important; }
          section[style*="display: flex"] > div { width: 100% !important; }
        }
      `}</style>
    </div>
  );
}