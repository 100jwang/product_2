/**
 * Sky-Blue Community Platform
 * Built with Web Components & Modern CSS
 */

import { 
    onAuthStateChanged, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const MOCK_DATA = {
    categories: [
        { id: 'tech', name: '기술 & 개발', icon: '💻', sub: ['자바스크립트', '인공지능', '프론트엔드'] },
        { id: 'life', name: '라이프스타일', icon: '🌿', sub: ['건강', '인테리어', '맛집'] },
        { id: 'market', name: '정보 장터', icon: '🛒', sub: ['중고거래', '무료나눔', '구매대행'] },
        { id: 'hobby', name: '취미 생활', icon: '🎨', sub: ['드로잉', '사진', '캠핑'] }
    ]
};

// --- Web Components ---

class CommunityApp extends HTMLElement {
    constructor() {
        super();
        this.viewState = 'welcome'; // 'welcome', 'chat', 'feedback'
        this.activeCategory = null;
        this.user = null;
    }

    connectedCallback() {
        this.render();
        
        // Listen for Auth changes
        onAuthStateChanged(window.auth, (user) => {
            this.user = user;
            this.render();
        });

        this.addEventListener('category-change', (e) => {
            if (!this.user) {
                this.showAuthModal();
                return;
            }
            const catId = e.detail.id;
            this.activeCategory = MOCK_DATA.categories.find(c => c.id === catId);
            this.viewState = 'chat';
            this.render();
        });
        
        this.addEventListener('go-home', () => {
            this.activeCategory = null;
            this.viewState = 'welcome';
            this.render();
        });

        this.addEventListener('go-feedback', () => {
            if (!this.user) {
                this.showAuthModal();
                return;
            }
            this.activeCategory = null;
            this.viewState = 'feedback';
            this.render();
        });

        this.addEventListener('logout', async () => {
            await signOut(window.auth);
            this.activeCategory = null;
            this.viewState = 'welcome';
            this.render();
        });
    }

    showAuthModal() {
        const modal = document.createElement('community-auth');
        document.body.appendChild(modal);
    }

    render() {
        let mainContent = '';
        if (this.viewState === 'welcome') {
            mainContent = `<community-welcome></community-welcome>`;
        } else if (this.viewState === 'feedback') {
            mainContent = `<community-feedback></community-feedback>`;
        } else if (this.viewState === 'chat' && this.activeCategory) {
            mainContent = `<community-chat active-id="${this.activeCategory.id}"></community-chat>`;
        }

        this.innerHTML = `
            <div class="app-container">
                <community-sidebar 
                    active-id="${this.activeCategory ? this.activeCategory.id : ''}" 
                    active-view="${this.viewState}"
                    user-name="${this.user ? (this.user.displayName || this.user.email) : ''}"
                    user-photo="${this.user ? this.user.photoURL : ''}">
                </community-sidebar>
                ${mainContent}
            </div>
        `;
    }
}

class CommunityAuth extends HTMLElement {
    connectedCallback() {
        this.isSignUp = false;
        this.render();
    }

    async handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(window.auth, provider);
            this.remove();
        } catch (error) {
            console.error(error);
            alert("Google 로그인 중 오류가 발생했습니다. Firebase 설정(API Key 등)을 확인해주세요.");
        }
    }

    async handleEmailAuth(e) {
        e.preventDefault();
        const email = this.querySelector('#email').value;
        const password = this.querySelector('#password').value;
        const name = this.querySelector('#name')?.value;

        try {
            if (this.isSignUp) {
                const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
            } else {
                await signInWithEmailAndPassword(window.auth, email, password);
            }
            this.remove();
        } catch (error) {
            console.error(error);
            alert(this.isSignUp ? "회원가입 중 오류가 발생했습니다." : "로그인 정보가 올바르지 않습니다.");
        }
    }

    toggleMode() {
        this.isSignUp = !this.isSignUp;
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                community-auth {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                    font-family: 'Inter', sans-serif;
                }
                .auth-card {
                    background: white;
                    padding: 40px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    width: 100%;
                    max-width: 400px;
                    text-align: center;
                }
                .auth-card h2 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: var(--spacing-md);
                    color: var(--primary-color);
                }
                .auth-card p {
                    color: var(--text-muted);
                    margin-bottom: var(--spacing-lg);
                    font-size: 0.9rem;
                }
                .form-group {
                    margin-bottom: var(--spacing-md);
                    text-align: left;
                }
                .form-group label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    outline: none;
                }
                .auth-btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    cursor: pointer;
                    margin-bottom: var(--spacing-md);
                }
                .google-btn {
                    width: 100%;
                    padding: 12px;
                    background: white;
                    color: var(--text-color);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: var(--spacing-lg);
                }
                .toggle-mode {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    cursor: pointer;
                }
                .toggle-mode span {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                .close-btn {
                    margin-top: var(--spacing-md);
                    font-size: 0.8rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    text-decoration: underline;
                }
            </style>
            <div class="auth-card">
                <h2>${this.isSignUp ? "회원가입" : "로그인"}</h2>
                <p>커뮤니티 활동을 위해 로그인이 필요합니다.</p>
                
                <button class="google-btn">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" width="18">
                    Google로 ${this.isSignUp ? "시작하기" : "로그인"}
                </button>
                
                <div style="margin: 20px 0; color: #ccc; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
                    <div style="flex: 1; height: 1px; background: #eee;"></div>
                    또는 이메일로 ${this.isSignUp ? "가입" : "로그인"}
                    <div style="flex: 1; height: 1px; background: #eee;"></div>
                </div>

                <form id="auth-form">
                    ${this.isSignUp ? `
                    <div class="form-group">
                        <label>이름</label>
                        <input type="text" id="name" placeholder="홍길동" required>
                    </div>
                    ` : ''}
                    <div class="form-group">
                        <label>이메일</label>
                        <input type="email" id="email" placeholder="example@email.com" required>
                    </div>
                    <div class="form-group">
                        <label>비밀번호</label>
                        <input type="password" id="password" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="auth-btn">${this.isSignUp ? "가입하기" : "로그인"}</button>
                </form>
                
                <div class="toggle-mode">
                    ${this.isSignUp ? "이미 계정이 있으신가요?" : "처음이신가요?"}
                    <span id="toggle-auth">${this.isSignUp ? "로그인하기" : "회원가입하기"}</span>
                </div>
                
                <div class="close-btn" id="close-auth">나중에 하기</div>
            </div>
        `;

        this.querySelector('.google-btn').onclick = () => this.handleGoogleLogin();
        this.querySelector('#auth-form').onsubmit = (e) => this.handleEmailAuth(e);
        this.querySelector('#toggle-auth').onclick = () => this.toggleMode();
        this.querySelector('#close-auth').onclick = () => this.remove();
    }
}

class CommunityFeedback extends HTMLElement {
    connectedCallback() {
        this.render();
        this.initForm();
    }

    initForm() {
        setTimeout(() => {
            if (window.formspree) {
                window.formspree('initForm', { 
                    formElement: this.querySelector('#feedback-form'), 
                    formId: 'xqenygrb' 
                });
            }
        }, 100);
    }

    render() {
        this.innerHTML = `
            <style>
                community-feedback {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: var(--bg-color);
                    padding: var(--spacing-lg);
                }
                .feedback-container {
                    width: 100%;
                    max-width: 500px;
                    background: white;
                    padding: 40px;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border-color);
                }
                .feedback-container h2 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: var(--spacing-sm);
                    color: var(--primary-color);
                }
                .feedback-container p {
                    color: var(--text-muted);
                    margin-bottom: var(--spacing-lg);
                }
                .form-group {
                    margin-bottom: var(--spacing-md);
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--text-color);
                }
                .form-group input, .form-group textarea {
                    padding: 12px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-group input:focus, .form-group textarea:focus {
                    border-color: var(--primary-color);
                }
                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background-color: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 700;
                    cursor: pointer;
                    transition: opacity 0.2s;
                    margin-top: var(--spacing-md);
                }
                .submit-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                [data-fs-success] {
                    display: none;
                    text-align: center;
                    padding: 20px;
                    background: oklch(95% 0.05 145);
                    color: oklch(40% 0.1 145);
                    border-radius: var(--radius-md);
                    margin-bottom: 20px;
                }
                [data-fs-error] {
                    display: none;
                    text-align: center;
                    padding: 10px;
                    color: oklch(55% 0.2 25);
                    font-size: 0.85rem;
                }
            </style>
            <div class="feedback-container">
                <div data-fs-success>의견을 보내주셔서 감사합니다! 소중히 검토하겠습니다. ✨</div>
                <div data-fs-error>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>
                
                <h2>의견 보내기</h2>
                <p>Sky-Blue 커뮤니티를 위한 소중한 의견을 남겨주세요.</p>
                
                <form id="feedback-form">
                    <div class="form-group">
                        <label for="email">이메일 주소</label>
                        <input type="email" id="email" name="email" placeholder="example@email.com" required data-fs-field>
                        <span data-fs-error="email"></span>
                    </div>
                    <div class="form-group">
                        <label for="message">의견 내용</label>
                        <textarea id="message" name="message" rows="5" placeholder="커뮤니티 발전을 위한 의견을 자유롭게 적어주세요." required data-fs-field></textarea>
                        <span data-fs-error="message"></span>
                    </div>
                    <button type="submit" class="submit-btn" data-fs-submit-btn>의견 제출하기</button>
                </form>
            </div>
        `;
    }
}

class CommunityWelcome extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <style>
                community-welcome {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    text-align: center;
                    background-color: var(--bg-color);
                    padding: var(--spacing-lg);
                }
                .welcome-card {
                    max-width: 600px;
                    padding: 60px;
                    background: white;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--border-color);
                    animation: fadeIn 0.8s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .welcome-icon {
                    font-size: 4rem;
                    margin-bottom: var(--spacing-lg);
                }
                .welcome-card h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: var(--spacing-md);
                    background: linear-gradient(135deg, var(--text-color), var(--primary-color));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .welcome-card p {
                    color: var(--text-muted);
                    font-size: 1.1rem;
                    margin-bottom: var(--spacing-lg);
                    line-height: 1.6;
                }
                .explore-hint {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background-color: var(--surface-color);
                    color: var(--primary-color);
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    font-size: 0.9rem;
                }
            </style>
            <div class="welcome-card">
                <div class="welcome-icon">✨</div>
                <h1>Welcome to<br>Sky-Blue Community</h1>
                <p>세련된 정보 공유의 시작. 왼쪽 사이드바에서 관심 있는 카테고리를 선택하여 대화에 참여해보세요.</p>
                <div class="explore-hint">
                    👈 왼쪽에서 카테고리를 선택해주세요
                </div>
            </div>
        `;
    }
}

class CommunitySidebar extends HTMLElement {
    static get observedAttributes() { return ['active-id', 'active-view', 'user-name', 'user-photo']; }

    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const activeId = this.getAttribute('active-id');
        const activeView = this.getAttribute('active-view');
        const userName = this.getAttribute('user-name');
        const userPhoto = this.getAttribute('user-photo');

        this.innerHTML = `
            <style>
                community-sidebar {
                    background-color: var(--surface-color);
                    border-right: 1px solid var(--border-color);
                    padding: var(--spacing-lg);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }
                .logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    margin-bottom: var(--spacing-lg);
                }
                .sidebar-nav {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-lg);
                    overflow-y: auto;
                }
                .cat-list {
                    list-style: none;
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-sm);
                }
                .cat-item {
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-md);
                    font-weight: 600;
                    border: 1px solid transparent;
                }
                .cat-item:hover {
                    background-color: var(--bg-color);
                    box-shadow: var(--shadow-sm);
                    color: var(--primary-color);
                }
                .cat-item.active {
                    background-color: var(--bg-color);
                    color: var(--primary-color);
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--primary-glow);
                }
                .sub-list {
                    margin-left: calc(var(--spacing-md) + 24px);
                    margin-top: var(--spacing-sm);
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .sidebar-footer {
                    padding-top: var(--spacing-lg);
                    border-top: 1px solid var(--border-color);
                    margin-top: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .user-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: white;
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-sm);
                    margin-bottom: 8px;
                }
                .user-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary-glow);
                    object-fit: cover;
                }
                .user-details {
                    flex: 1;
                    overflow: hidden;
                }
                .user-name {
                    font-size: 0.85rem;
                    font-weight: 700;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .logout-btn {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    text-decoration: underline;
                }
                .feedback-btn {
                    width: 100%;
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    font-weight: 600;
                    transition: all 0.2s;
                    color: var(--text-muted);
                }
                .feedback-btn:hover, .feedback-btn.active {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    background: var(--bg-color);
                }
            </style>
            <div class="logo" style="cursor: pointer;">SKY BLUE</div>
            <div class="sidebar-nav">
                <ul class="cat-list">
                    ${MOCK_DATA.categories.map(cat => `
                        <li class="cat-group">
                            <div class="cat-item ${cat.id === activeId ? 'active' : ''}" data-id="${cat.id}">
                                <span>${cat.icon}</span>
                                <span>${cat.name}</span>
                            </div>
                            <div class="sub-list">
                                ${cat.sub.map(s => `<div># ${s}</div>`).join('')}
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="sidebar-footer">
                ${userName ? `
                    <div class="user-info">
                        <img class="user-avatar" src="${userPhoto || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="Avatar">
                        <div class="user-details">
                            <div class="user-name">${userName}</div>
                            <div class="logout-btn" id="logout-trigger">로그아웃</div>
                        </div>
                    </div>
                ` : ''}
                <button class="feedback-btn ${activeView === 'feedback' ? 'active' : ''}">
                    <span>💬</span> 의견 제공
                </button>
            </div>
        `;

        this.querySelector('.logo').onclick = () => {
            this.dispatchEvent(new CustomEvent('go-home', { bubbles: true }));
        };

        this.querySelector('.feedback-btn').onclick = () => {
            this.dispatchEvent(new CustomEvent('go-feedback', { bubbles: true }));
        };

        if (userName) {
            this.querySelector('#logout-trigger').onclick = () => {
                this.dispatchEvent(new CustomEvent('logout', { bubbles: true }));
            };
        }

        this.querySelectorAll('.cat-item').forEach(item => {
            item.onclick = () => {
                this.dispatchEvent(new CustomEvent('category-change', {
                    bubbles: true,
                    detail: { id: item.dataset.id }
                }));
            };
        });
    }
}

class CommunityChat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.messages = [];
        this.unsubscribe = null;
        this.isLoading = true;
    }

    static get observedAttributes() { return ['active-id']; }

    attributeChangedCallback() {
        this.setupRealtimeMessages();
        this.render();
    }

    connectedCallback() {
        this.setupRealtimeMessages();
        this.render();
    }

    disconnectedCallback() {
        if (this.unsubscribe) this.unsubscribe();
    }

    setupRealtimeMessages() {
        if (this.unsubscribe) this.unsubscribe();
        
        const catId = this.getAttribute('active-id');
        if (!catId) return;

        this.isLoading = true;
        this.render();

        try {
            const q = query(
                collection(window.db, "messages"),
                where("categoryId", "==", catId),
                orderBy("timestamp", "asc")
            );

            this.unsubscribe = onSnapshot(q, (snapshot) => {
                this.messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                this.isLoading = false;
                this.render();
                this.scrollToBottom();
            }, (error) => {
                console.error("Firestore Snapshot Error:", error);
                this.isLoading = false;
                this.render();
            });
        } catch (error) {
            console.error("Firestore Query Error:", error);
            this.isLoading = false;
            this.render();
        }
    }

    async sendMessage() {
        const input = this.shadowRoot.querySelector('.message-input');
        const btn = this.shadowRoot.querySelector('.send-btn');
        const text = input.value.trim();
        
        if (!text || btn.disabled) return;

        const user = window.auth.currentUser;
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        const catId = this.getAttribute('active-id');

        try {
            btn.disabled = true;
            btn.textContent = '...';
            
            await addDoc(collection(window.db, "messages"), {
                categoryId: catId,
                userId: user.uid,
                userName: user.displayName || user.email,
                userPhoto: user.photoURL,
                text: text,
                timestamp: serverTimestamp()
            });
            
            input.value = '';
        } catch (error) {
            console.error("Error sending message: ", error);
            alert("메시지 전송 중 오류가 발생했습니다. Firestore 규칙이나 인덱스 설정을 확인해주세요.");
        } finally {
            btn.disabled = false;
            btn.textContent = '전송';
            input.focus();
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const list = this.shadowRoot.querySelector('.message-list');
            if (list) list.scrollTop = list.scrollHeight;
        }, 100);
    }

    render() {
        const catId = this.getAttribute('active-id');
        const cat = MOCK_DATA.categories.find(c => c.id === catId);
        if (!cat) return;

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    background-color: oklch(100% 0 0);
                    color: oklch(25% 0.02 230);
                    font-family: 'Inter', system-ui, sans-serif;
                }
                .chat-header {
                    padding: 24px;
                    border-bottom: 1px solid oklch(90% 0.01 230);
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    background: white;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .chat-header h2 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    margin: 0;
                }
                .message-list {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .input-area {
                    padding: 24px;
                    border-top: 1px solid oklch(90% 0.01 230);
                    display: flex;
                    gap: 16px;
                    background: white;
                }
                .message-input {
                    flex: 1;
                    padding: 12px 20px;
                    border-radius: 20px;
                    border: 1px solid oklch(90% 0.01 230);
                    font-family: inherit;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .message-input:focus {
                    border-color: oklch(75% 0.15 230);
                    box-shadow: 0 0 0 3px oklch(75% 0.15 230 / 20%);
                }
                .send-btn {
                    padding: 12px 24px;
                    background-color: oklch(75% 0.15 230);
                    color: white;
                    border: none;
                    border-radius: 20px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.1s, background-color 0.2s;
                }
                .send-btn:hover {
                    background-color: oklch(70% 0.18 230);
                }
                .send-btn:active {
                    transform: scale(0.95);
                }
                .empty-msg {
                    text-align: center;
                    color: oklch(50% 0.02 230);
                    margin-top: 2rem;
                }
                .loading-msg {
                    text-align: center;
                    color: var(--primary-color);
                    margin-top: 2rem;
                    font-weight: 600;
                }
            </style>
            <div class="chat-header">
                <span>${cat.icon}</span>
                <h2>${cat.name} 정보공유방</h2>
            </div>
            <div class="message-list">
                ${this.isLoading ? '<div class="loading-msg">메시지를 불러오는 중...</div>' : ''}
                ${!this.isLoading && this.messages.map(msg => `
                    <community-message 
                        user="${msg.userName}" 
                        text="${msg.text}" 
                        time="${msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '전송 중...'}" 
                        photo="${msg.userPhoto || ''}"
                        ${msg.userId === window.auth.currentUser?.uid ? 'mine' : ''}>
                    </community-message>
                `).join('')}
                ${!this.isLoading && this.messages.length === 0 ? '<div class="empty-msg">아직 대화가 없습니다. 첫 메시지를 남겨보세요!</div>' : ''}
            </div>
            <div class="input-area">
                <input type="text" class="message-input" placeholder="정보를 공유해보세요..." ${this.isLoading ? 'disabled' : ''}>
                <button class="send-btn" ${this.isLoading ? 'disabled' : ''}>전송</button>
            </div>
        `;

        const sendBtn = this.shadowRoot.querySelector('.send-btn');
        const input = this.shadowRoot.querySelector('.message-input');

        if (sendBtn) sendBtn.onclick = () => this.sendMessage();
        if (input) input.onkeydown = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    }
}

class CommunityMessage extends HTMLElement {
    connectedCallback() {
        const user = this.getAttribute('user');
        const text = this.getAttribute('text');
        const time = this.getAttribute('time');
        const photo = this.getAttribute('photo');
        const isMine = this.hasAttribute('mine');

        this.innerHTML = `
            <style>
                community-message {
                    display: flex;
                    align-items: flex-end;
                    gap: 12px;
                    flex-direction: ${isMine ? 'row-reverse' : 'row'};
                }
                .avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: var(--primary-glow);
                    flex-shrink: 0;
                    object-fit: cover;
                }
                .msg-content {
                    display: flex;
                    flex-direction: column;
                    align-items: ${isMine ? 'flex-end' : 'flex-start'};
                    gap: 4px;
                    max-width: 70%;
                }
                .user-name {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .bubble {
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    font-size: 0.95rem;
                    box-shadow: var(--shadow-sm);
                    position: relative;
                }
                .bubble-mine {
                    background-color: var(--primary-color);
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                .bubble-other {
                    background-color: var(--surface-color);
                    color: var(--text-color);
                    border-bottom-left-radius: 4px;
                    border: 1px solid var(--border-color);
                }
                .time {
                    font-size: 0.65rem;
                    color: var(--text-muted);
                }
            </style>
            <img class="avatar" src="${photo || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="Avatar">
            <div class="msg-content">
                <span class="user-name">${user}</span>
                <div class="bubble ${isMine ? 'bubble-mine' : 'bubble-other'}">
                    ${text}
                </div>
                <span class="time">${time}</span>
            </div>
        `;
    }
}

customElements.define('community-app', CommunityApp);
customElements.define('community-auth', CommunityAuth);
customElements.define('community-sidebar', CommunitySidebar);
customElements.define('community-chat', CommunityChat);
customElements.define('community-message', CommunityMessage);
customElements.define('community-welcome', CommunityWelcome);
customElements.define('community-feedback', CommunityFeedback);
