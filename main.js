/**
 * Sky-Blue Community Platform
 * Built with Web Components & Modern CSS
 */

const MOCK_DATA = {
    categories: [
        { id: 'tech', name: '기술 & 개발', icon: '💻', sub: ['자바스크립트', '인공지능', '프론트엔드'] },
        { id: 'life', name: '라이프스타일', icon: '🌿', sub: ['건강', '인테리어', '맛집'] },
        { id: 'market', name: '정보 장터', icon: '🛒', sub: ['중고거래', '무료나눔', '구매대행'] },
        { id: 'hobby', name: '취미 생활', icon: '🎨', sub: ['드로잉', '사진', '캠핑'] }
    ],
    messages: {
        'tech': [
            { id: 1, user: 'DevKing', text: '여러분, 최근에 나온 Baseline 기능들 보셨나요? 대단하네요!', time: '오후 2:30', mine: false },
            { id: 2, user: '나', text: '네! 특히 :has() 선택자가 정말 유용한 것 같아요.', time: '오후 2:31', mine: true }
        ],
        'life': [
            { id: 1, user: '식물집사', text: '몬스테라 잎이 노랗게 변하는데 이유를 아시는 분?', time: '오후 1:15', mine: false },
            { id: 2, user: '닥터플랜트', text: '과습일 확률이 높아요. 통풍에 신경 써보세요!', time: '오후 1:20', mine: false }
        ]
    }
};

// --- Web Components ---

class CommunityApp extends HTMLElement {
    constructor() {
        super();
        this.activeCategory = MOCK_DATA.categories[0];
    }

    connectedCallback() {
        this.render();
        this.addEventListener('category-change', (e) => {
            const catId = e.detail.id;
            this.activeCategory = MOCK_DATA.categories.find(c => c.id === catId);
            this.render();
        });
    }

    render() {
        this.innerHTML = `
            <div class="app-container">
                <community-sidebar active-id="${this.activeCategory.id}"></community-sidebar>
                <community-chat active-id="${this.activeCategory.id}"></community-chat>
            </div>
        `;
    }
}

class CommunitySidebar extends HTMLElement {
    static get observedAttributes() { return ['active-id']; }

    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const activeId = this.getAttribute('active-id');
        this.innerHTML = `
            <style>
                community-sidebar {
                    background-color: var(--surface-color);
                    border-right: 1px solid var(--border-color);
                    padding: var(--spacing-lg);
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacing-lg);
                }
                .logo {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary-color);
                    margin-bottom: var(--spacing-md);
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
            </style>
            <div class="logo">SKY BLUE</div>
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
        `;

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
    }

    static get observedAttributes() { return ['active-id']; }

    attributeChangedCallback() {
        this.loadMessages();
        this.render();
    }

    connectedCallback() {
        this.loadMessages();
        this.render();
    }

    loadMessages() {
        const catId = this.getAttribute('active-id');
        this.messages = [...(MOCK_DATA.messages[catId] || [])];
    }

    sendMessage() {
        const input = this.shadowRoot.querySelector('.message-input');
        if (!input.value.trim()) return;

        const newMessage = {
            id: Date.now(),
            user: '나',
            text: input.value,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mine: true
        };

        this.messages.push(newMessage);
        input.value = '';
        this.render();
        
        // Auto-scroll to bottom
        setTimeout(() => {
            const list = this.shadowRoot.querySelector('.message-list');
            list.scrollTop = list.scrollHeight;
        }, 0);
    }

    render() {
        const catId = this.getAttribute('active-id');
        const cat = MOCK_DATA.categories.find(c => c.id === catId);

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
            </style>
            <div class="chat-header">
                <span>${cat.icon}</span>
                <h2>${cat.name} 정보공유방</h2>
            </div>
            <div class="message-list">
                ${this.messages.map(msg => `
                    <community-message 
                        user="${msg.user}" 
                        text="${msg.text}" 
                        time="${msg.time}" 
                        ${msg.mine ? 'mine' : ''}>
                    </community-message>
                `).join('')}
                ${this.messages.length === 0 ? '<div class="empty-msg">아직 대화가 없습니다. 첫 메시지를 남겨보세요!</div>' : ''}
            </div>
            <div class="input-area">
                <input type="text" class="message-input" placeholder="정보를 공유해보세요...">
                <button class="send-btn">전송</button>
            </div>
        `;

        this.shadowRoot.querySelector('.send-btn').onclick = () => this.sendMessage();
        this.shadowRoot.querySelector('.message-input').onkeydown = (e) => {
            if (e.key === 'Enter') this.sendMessage();
        };
    }
}

class CommunityMessage extends HTMLElement {
    connectedCallback() {
        const user = this.getAttribute('user');
        const text = this.getAttribute('text');
        const time = this.getAttribute('time');
        const isMine = this.hasAttribute('mine');

        this.innerHTML = `
            <style>
                community-message {
                    display: flex;
                    flex-direction: column;
                    align-items: ${isMine ? 'flex-end' : 'flex-start'};
                    gap: 4px;
                }
                .user-name {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .bubble {
                    padding: var(--spacing-md);
                    border-radius: var(--radius-md);
                    max-width: 70%;
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
            <span class="user-name">${user}</span>
            <div class="bubble ${isMine ? 'bubble-mine' : 'bubble-other'}">
                ${text}
            </div>
            <span class="time">${time}</span>
        `;
    }
}

customElements.define('community-app', CommunityApp);
customElements.define('community-sidebar', CommunitySidebar);
customElements.define('community-chat', CommunityChat);
customElements.define('community-message', CommunityMessage);
