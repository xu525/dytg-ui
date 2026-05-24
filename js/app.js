// 奖励规则数据存储
let rewardRules = [
    { min: 0, max: 10, amount: 1 },
    { min: 10, max: 100, amount: 2 },
    { min: 100, max: null, amount: 3 }
];


document.addEventListener('DOMContentLoaded', () => {
    initPageNavigation();
    initAgentTabs();
    initModal();
    initRewardModal();
    initAgentActions();
    initRewardActions();
});

function initPageNavigation() {
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    const backButtons = document.querySelectorAll('[data-back]');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page') + '-page';
            navigateTo(pageId);
        });
    });

    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo('home-page');
        });
    });
}

function navigateTo(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 根据页面类型渲染对应内容
    if (pageId === 'settlement-list-page') {
        renderSettlementListFull();
    } else if (pageId === 'balance-detail-page') {
        renderBalanceDetailList();
    } else if (pageId === 'commission-detail-page') {
        renderCommissionDetailList();
    } else if (pageId === 'balance-withdraw-record-page') {
        renderWithdrawRecordList('balance');
    } else if (pageId === 'commission-withdraw-record-page') {
        renderWithdrawRecordList('commission');
    } else if (pageId === 'withdraw-process-page') {
        initWithdrawProcessPage();
    } else if (pageId === 'recharge-record-page') {
        renderRechargeRecordList();
    } else if (pageId === 'message-list-page') {
        renderMessageList();
    } else if (pageId === 'card-detail-page') {
        renderCardDetail();
    } else if (pageId === 'recharge-page') {
        initRechargePage();
        renderRechargeRecordList();
    } else if (pageId === 'purchase-detail-page') {
        renderPurchaseDetail();
    }
}

function initAgentTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab') + '-tab';

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

function initModal() {
    const modal = document.getElementById('agent-modal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const closeButtons = modal.querySelectorAll('[data-action="close-modal"]');
    const createBtn = document.querySelector('[data-action="show-create-agent"]');
    const saveBtn = modal.querySelector('[data-action="save-agent"]');
    const modalTitle = document.getElementById('modal-title');
    const agentForm = document.getElementById('agent-form');

    function openModal(mode = 'create', agentData = null) {
        modal.classList.add('active');
        modalTitle.textContent = mode === 'create' ? '创建代理' : '编辑代理';

        if (mode === 'create') {
            agentForm.reset();
        } else if (agentData) {
            agentForm.querySelector('[name="username"]').value = agentData.username || '';
            agentForm.querySelector('[name="phone"]').value = agentData.phone || '';
            agentForm.querySelector('[name="name"]').value = agentData.name || '';
        }

        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        agentForm.reset();
    }

    if (createBtn) {
        createBtn.addEventListener('click', () => openModal('create'));
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    modalOverlay.addEventListener('click', closeModal);

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const formData = new FormData(agentForm);
            const data = Object.fromEntries(formData.entries());
            console.log('保存代理数据:', data);
            alert('保存成功！');
            closeModal();
        });
    }

    window.openAgentModal = openModal;
}

function initRewardModal() {
    const modal = document.getElementById('reward-modal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const closeButtons = modal.querySelectorAll('[data-action="close-reward-modal"]');
    const saveBtn = modal.querySelector('[data-action="save-reward"]');
    const modalTitle = document.getElementById('reward-modal-title');
    const rewardForm = document.getElementById('reward-form');
    const unlimitedCheckbox = document.getElementById('unlimited-max');
    const maxCountGroup = document.getElementById('max-count-group');

    // 切换不设上限选项
    if (unlimitedCheckbox) {
        unlimitedCheckbox.addEventListener('change', (e) => {
            maxCountGroup.style.display = e.target.checked ? 'none' : 'block';
        });
    }

    function openRewardModal(mode = 'create', ruleIndex = -1, ruleData = null) {
        modal.classList.add('active');
        modalTitle.textContent = mode === 'create' ? '添加奖励规则' : '编辑奖励规则';

        rewardForm.reset();
        document.getElementById('rule-index').value = ruleIndex;
        maxCountGroup.style.display = 'block';
        unlimitedCheckbox.checked = false;

        if (mode === 'edit' && ruleData) {
            document.getElementById('min-count').value = ruleData.min;
            document.getElementById('reward-amount').value = ruleData.amount;
            if (ruleData.max === null) {
                unlimitedCheckbox.checked = true;
                maxCountGroup.style.display = 'none';
            } else {
                document.getElementById('max-count').value = ruleData.max;
            }
        }

        document.body.style.overflow = 'hidden';
    }

    function closeRewardModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        rewardForm.reset();
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeRewardModal);
    });

    modalOverlay.addEventListener('click', closeRewardModal);

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const ruleIndex = parseInt(document.getElementById('rule-index').value);
            const minCount = parseInt(document.getElementById('min-count').value);
            const amount = parseFloat(document.getElementById('reward-amount').value);
            const isUnlimited = unlimitedCheckbox.checked;
            let maxCount = isUnlimited ? null : parseInt(document.getElementById('max-count').value);

            // 验证
            if (isNaN(minCount)) {
                alert('请输入最小推广人数');
                return;
            }
            if (!isUnlimited && isNaN(maxCount)) {
                alert('请输入最大推广人数');
                return;
            }
            if (!isUnlimited && maxCount <= minCount) {
                alert('最大人数必须大于最小人数');
                return;
            }
            if (isNaN(amount) || amount <= 0) {
                alert('请输入有效的奖励金额');
                return;
            }

            const newRule = { min: minCount, max: maxCount, amount: amount };

            if (ruleIndex === -1) {
                rewardRules.push(newRule);
            } else {
                rewardRules[ruleIndex] = newRule;
            }

            renderRewardRules();
            console.log('保存奖励规则:', rewardRules);
            alert('保存成功！');
            closeRewardModal();
        });
    }

    window.openRewardModal = openRewardModal;
}

function initAgentActions() {
    const agentList = document.querySelector('.agent-list');

    if (agentList) {
        agentList.addEventListener('click', (e) => {
            const target = e.target;
            const agentItem = target.closest('.agent-item');

            if (!agentItem) return;

            const agentName = agentItem.querySelector('.agent-name').textContent;
            const agentPhone = agentItem.querySelector('.agent-phone').textContent;

            if (target.classList.contains('edit')) {
                window.openAgentModal('edit', {
                    name: agentName,
                    phone: agentPhone,
                    username: agentName.toLowerCase()
                });
            } else if (target.classList.contains('disable')) {
                if (confirm(`确定要禁用代理 ${agentName} 吗？`)) {
                    const statusEl = agentItem.querySelector('.agent-status');
                    statusEl.classList.remove('active');
                    statusEl.classList.add('disabled');
                    statusEl.textContent = '已禁用';
                    target.classList.remove('disable');
                    target.classList.add('enable');
                    target.textContent = '启用';
                }
            } else if (target.classList.contains('enable')) {
                if (confirm(`确定要启用代理 ${agentName} 吗？`)) {
                    const statusEl = agentItem.querySelector('.agent-status');
                    statusEl.classList.remove('disabled');
                    statusEl.classList.add('active');
                    statusEl.textContent = '正常';
                    target.classList.remove('enable');
                    target.classList.add('disable');
                    target.textContent = '禁用';
                }
            }
        });
    }

    const savePricesBtn = document.querySelector('.save-prices-btn');
    if (savePricesBtn) {
        savePricesBtn.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.card-price-item input');
            const prices = [];
            inputs.forEach(input => {
                const cardType = input.closest('.card-price-item').querySelector('.card-type').textContent;
                prices.push({ type: cardType, price: input.value });
            });
            console.log('保存电影卡价格:', prices);
            alert('价格设置已保存！');
        });
    }
}

function initRewardActions() {
    const addRuleBtn = document.querySelector('[data-action="show-add-rule"]');
    const rulesContainer = document.getElementById('reward-rules-container');

    // 添加规则按钮
    if (addRuleBtn) {
        addRuleBtn.addEventListener('click', () => {
            window.openRewardModal('create', -1, null);
        });
    }

    // 规则列表事件委托
    if (rulesContainer) {
        rulesContainer.addEventListener('click', (e) => {
            const target = e.target;
            const ruleItem = target.closest('.reward-rule');
            
            if (!ruleItem) return;
            
            const allRules = Array.from(rulesContainer.querySelectorAll('.reward-rule'));
            const ruleIndex = allRules.indexOf(ruleItem);

            if (target.classList.contains('rule-edit')) {
                // 编辑规则
                const ruleData = rewardRules[ruleIndex];
                window.openRewardModal('edit', ruleIndex, ruleData);
            } else if (target.classList.contains('rule-delete')) {
                // 删除规则
                if (confirm('确定要删除这条奖励规则吗？')) {
                    rewardRules.splice(ruleIndex, 1);
                    renderRewardRules();
                    console.log('删除奖励规则，当前规则:', rewardRules);
                }
            }
        });
    }
}

// 渲染奖励规则列表
function renderRewardRules() {
    const container = document.getElementById('reward-rules-container');
    if (!container) return;

    container.innerHTML = rewardRules.map((rule, index) => {
        let rangeText = '';
        if (rule.max === null) {
            rangeText = `${rule.min}人以上`;
        } else {
            rangeText = `${rule.min} - ${rule.max}人`;
        }

        return `
            <div class="reward-rule" data-min="${rule.min}" data-max="${rule.max || ''}" data-amount="${rule.amount}">
                <div class="rule-range">${rangeText}</div>
                <div class="rule-amount">¥${rule.amount.toFixed(2)}/人</div>
                <div class="rule-actions">
                    <button class="rule-edit">编辑</button>
                    <button class="rule-delete">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

// 电影卡数据
let movieCards = [
    { id: 1, number: '888866667777', type: 'year', expiry: '2027-12-31', created: '2026-01-15', sold: false },
    { id: 2, number: '888866668888', type: 'month', expiry: '2026-06-30', created: '2026-03-10', sold: false },
    { id: 3, number: '888866669999', type: 'times', expiry: '2026-08-15', created: '2026-02-20', sold: false },
    { id: 4, number: '888866660001', type: 'year', expiry: '2027-11-30', created: '2026-01-05', sold: true, soldDate: '2026-05-10', remark: '客户张总购买' },
    { id: 5, number: '888866660002', type: 'month', expiry: '2026-07-31', created: '2026-02-15', sold: true, soldDate: '2026-05-15', remark: '活动赠送' },
    { id: 6, number: '888866660003', type: 'times', expiry: '2026-09-30', created: '2026-03-01', sold: false },
    { id: 7, number: '888866660004', type: 'year', expiry: '2027-10-31', created: '2026-02-10', sold: true, soldDate: '2026-05-18', remark: '' },
    { id: 8, number: '888866660005', type: 'month', expiry: '2026-08-31', created: '2026-03-05', sold: false },
];

let selectedCardForMark = null;
let currentCardForDetail = null;

// 初始化电影卡管理功能
function initCardManagement() {
    // 查看更多链接点击事件
    const viewMoreLink = document.querySelector('[data-page="card-list-page"]');
    if (viewMoreLink) {
        viewMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('card-list-page');
            renderCardListFull();
        });
    }

    // 电影卡列表点击事件 - 首页
    const cardListContainer = document.getElementById('card-list-container');
    if (cardListContainer) {
        cardListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('mark-btn')) {
                e.stopPropagation();
                const cardItem = e.target.closest('.card-item');
                const cardNumber = cardItem.dataset.cardNumber;
                openMarkSoldModal(cardNumber);
            } else {
                const cardItem = e.target.closest('.card-item');
                if (cardItem) {
                    const cardNumber = cardItem.dataset.cardNumber;
                    navigateToCardDetail(cardNumber);
                }
            }
        });
    }

    // 筛选标签 - 电影卡列表页面
    const cardListPage = document.getElementById('card-list-page');
    if (cardListPage) {
        const filterTabs = cardListPage.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderCardListFull();
            });
        });

        // 搜索功能
        const searchInput = cardListPage.querySelector('#card-search-input');
        const searchBtn = cardListPage.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => renderCardListFull());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') renderCardListFull();
            });
        }

        // 日期筛选
        const filterBtn = cardListPage.querySelector('[data-action="filter-cards"]');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => renderCardListFull());
        }
    }

    // 关闭标记已售弹窗
    const markSoldModal = document.getElementById('mark-sold-modal');
    if (markSoldModal) {
        const closeMarkSoldBtn = markSoldModal.querySelectorAll('[data-action="close-mark-sold"]');
        closeMarkSoldBtn.forEach(btn => {
            btn.addEventListener('click', () => closeMarkSoldModal());
        });
        markSoldModal.querySelector('.modal-overlay').addEventListener('click', () => closeMarkSoldModal());

        // 确认标记已售
        const confirmBtn = markSoldModal.querySelector('[data-action="confirm-mark-sold"]');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => confirmMarkSold());
        }
    }

    // 初始渲染未售卡片列表
    renderCardList();
}

function renderCardList() {
    const container = document.getElementById('card-list-container');
    if (!container) return;
    
    const unsoldCards = movieCards.filter(c => !c.sold).slice(0, 3);
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    const typeClass = { year: 'year', month: 'month', times: 'times' };
    
    container.innerHTML = unsoldCards.map(card => `
        <div class="card-item" data-card-number="${card.number}">
            <div class="card-image">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%230f3460' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='24' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
            </div>
            <div class="card-info">
                <div class="card-number">NO.${card.number}</div>
                <div class="card-type-badge ${typeClass[card.type]}">${typeMap[card.type]}</div>
                <div class="card-detail">
                    <div class="detail-row">
                        <span class="label">有效期至：</span>
                        <span class="value">${card.expiry}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">创建时间：</span>
                        <span class="value">${card.created}</span>
                    </div>
                </div>
            </div>
            <div class="card-status">
                <span class="status-badge unsold">未售</span>
                <button class="mark-btn">标记已售</button>
            </div>
        </div>
    `).join('');

    updateCardStats();
}

function renderCardListFull() {
    const container = document.getElementById('card-list-full');
    if (!container) return;
    
    const cardListPage = document.getElementById('card-list-page');
    const activeFilter = cardListPage.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    const searchTerm = cardListPage.querySelector('#card-search-input')?.value?.toLowerCase() || '';
    const startDate = cardListPage.querySelector('#card-start-date')?.value || '';
    const endDate = cardListPage.querySelector('#card-end-date')?.value || '';

    let filtered = movieCards.filter(card => {
        if (activeFilter === 'unsold' && card.sold) return false;
        if (activeFilter === 'sold' && !card.sold) return false;
        if (searchTerm && !card.number.includes(searchTerm)) return false;
        if (startDate && card.soldDate && card.soldDate < startDate) return false;
        if (endDate && card.soldDate && card.soldDate > endDate) return false;
        return true;
    });

    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    const typeClass = { year: 'year', month: 'month', times: 'times' };

    container.innerHTML = filtered.map(card => {
        return `
            <div class="card-item" data-card-number="${card.number}">
                <div class="card-image">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%230f3460' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='24' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                </div>
                <div class="card-info">
                    <div class="card-number">NO.${card.number}</div>
                    <div class="card-type-badge ${typeClass[card.type]}">${typeMap[card.type]}</div>
                    <div class="card-detail">
                        <div class="detail-row">
                            <span class="label">有效期至：</span>
                            <span class="value">${card.expiry}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">创建时间：</span>
                            <span class="value">${card.created}</span>
                        </div>
                        ${card.sold ? `
                        <div class="detail-row">
                            <span class="label">售出日期：</span>
                            <span class="value">${card.soldDate}</span>
                        </div>
                        ${card.remark ? `
                        <div class="detail-row">
                            <span class="label">备注：</span>
                            <span class="value">${card.remark}</span>
                        </div>
                        ` : ''}
                        ` : ''}
                    </div>
                </div>
                <div class="card-status">
                    <span class="status-badge ${card.sold ? 'sold' : 'unsold'}">${card.sold ? '已售' : '未售'}</span>
                    ${!card.sold ? `<button class="mark-btn">标记已售</button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // 为新渲染的卡片添加点击事件
    container.querySelectorAll('.mark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cardItem = btn.closest('.card-item');
            const cardNumber = cardItem.dataset.cardNumber;
            openMarkSoldModal(cardNumber);
        });
    });
    
    // 为卡片添加点击查看详情事件
    container.querySelectorAll('.card-item').forEach(item => {
        item.addEventListener('click', () => {
            const cardNumber = item.dataset.cardNumber;
            navigateToCardDetail(cardNumber);
        });
    });

    updateCardStats();
}

function openMarkSoldModal(cardNumber) {
    selectedCardForMark = cardNumber;
    const modal = document.getElementById('mark-sold-modal');
    document.getElementById('sold-card-number').value = 'NO.' + cardNumber;
    document.getElementById('sold-remark').value = '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMarkSoldModal() {
    const modal = document.getElementById('mark-sold-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedCardForMark = null;
}

function confirmMarkSold() {
    if (!selectedCardForMark) return;
    
    const remark = document.getElementById('sold-remark').value;
    const card = movieCards.find(c => c.number === selectedCardForMark);
    
    if (card) {
        card.sold = true;
        card.soldDate = new Date().toISOString().split('T')[0];
        card.remark = remark;
        alert('标记成功！');
        closeMarkSoldModal();
        renderCardListFull();
        renderCardList();
    }
}

// 跳转到电影卡详情页面
function navigateToCardDetail(cardNumber) {
    currentCardForDetail = cardNumber;
    navigateTo('card-detail-page');
}

// 渲染电影卡详情页面
function renderCardDetail() {
    if (!currentCardForDetail) return;
    
    const card = movieCards.find(c => c.number === currentCardForDetail);
    if (!card) return;
    
    const container = document.getElementById('card-detail-content');
    if (!container) return;
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = `
        <div class="detail-card-header">
            <div class="detail-card-img">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%230f3460' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='32' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
            </div>
            <div class="detail-card-title">NO.${card.number}</div>
            <div class="detail-card-type">${typeMap[card.type]}</div>
        </div>
        
        <div class="detail-info-section">
            <div class="detail-info-title">基本信息</div>
            <div class="detail-info-item">
                <span class="detail-info-label">卡号</span>
                <span class="detail-info-value">NO.${card.number}</span>
            </div>
            <div class="detail-info-item">
                <span class="detail-info-label">类型</span>
                <span class="detail-info-value">${typeMap[card.type]}</span>
            </div>
            <div class="detail-info-item">
                <span class="detail-info-label">有效期至</span>
                <span class="detail-info-value">${card.expiry}</span>
            </div>
            <div class="detail-info-item">
                <span class="detail-info-label">创建时间</span>
                <span class="detail-info-value">${card.created}</span>
            </div>
            <div class="detail-info-item">
                <span class="detail-info-label">状态</span>
                <span class="detail-info-value">${card.sold ? '已售' : '未售'}</span>
            </div>
            ${card.sold ? `
            <div class="detail-info-item">
                <span class="detail-info-label">售出日期</span>
                <span class="detail-info-value">${card.soldDate}</span>
            </div>
            ` : ''}
            ${card.sold && card.remark ? `
            <div class="detail-info-item">
                <span class="detail-info-label">备注</span>
                <span class="detail-info-value">${card.remark}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="qr-section">
            <div class="qr-title">📱 激活二维码</div>
            <div class="qr-container">
                <div class="qr-placeholder">
                    <div class="qr-icon">📷</div>
                    <div class="qr-desc">扫码激活电影卡</div>
                </div>
            </div>
            <div class="qr-tip">
                扫描上方二维码可完成电影卡激活绑定<br>
                <strong>激活后可立即使用</strong>
            </div>
        </div>
    `;
}

function renderCardList() {
    const container = document.getElementById('card-list-container');
    const unsoldCards = movieCards.filter(c => !c.sold).slice(0, 3);
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    const typeClass = { year: 'year', month: 'month', times: 'times' };
    
    container.innerHTML = unsoldCards.map(card => `
        <div class="card-item" data-card-number="${card.number}">
            <div class="card-image">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%230f3460' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='24' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
            </div>
            <div class="card-info">
                <div class="card-number">NO.${card.number}</div>
                <div class="card-type-badge ${typeClass[card.type]}">${typeMap[card.type]}</div>
                <div class="card-detail">
                    <div class="detail-row">
                        <span class="label">有效期至：</span>
                        <span class="value">${card.expiry}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">创建时间：</span>
                        <span class="value">${card.created}</span>
                    </div>
                </div>
            </div>
            <div class="card-status">
                <span class="status-badge unsold">未售</span>
                <button class="mark-btn" data-action="mark-sold">标记已售</button>
            </div>
        </div>
    `).join('');

    updateCardStats();
}

function updateCardStats() {
    const unsoldCount = movieCards.filter(c => !c.sold).length;
    const soldCount = movieCards.filter(c => c.sold).length;
    
    const unsoldEl = document.getElementById('unsold-count');
    const soldEl = document.getElementById('sold-count');
    
    if (unsoldEl) unsoldEl.textContent = unsoldCount;
    if (soldEl) soldEl.textContent = soldCount;
}

// 推广记录数据
let promotionRecords = [
    { id: 1, agentName: '张明', agentPhone: '13912341234', promotedPhone: '15812349876', remark: '通过朋友圈推广', date: '2026-05-20', time: '14:30' },
    { id: 2, agentName: '李华', agentPhone: '13856785678', promotedPhone: '15956789012', remark: '客户推荐', date: '2026-05-19', time: '10:15' },
    { id: 3, agentName: '王芳', agentPhone: '13790129012', promotedPhone: '15090123456', remark: '微信群推广', date: '2026-05-18', time: '16:45' },
    { id: 4, agentName: '赵伟', agentPhone: '13611112222', promotedPhone: '15111112222', remark: '线下活动', date: '2026-05-17', time: '09:20' },
    { id: 5, agentName: '钱婷', agentPhone: '13533334444', promotedPhone: '15233334444', remark: '朋友介绍', date: '2026-05-16', time: '11:00' },
    { id: 6, agentName: '孙磊', agentPhone: '13455556666', promotedPhone: '15355556666', remark: '朋友圈推广', date: '2026-05-15', time: '15:30' },
    { id: 7, agentName: '周静', agentPhone: '13377778888', promotedPhone: '15477778888', remark: '客户转介绍', date: '2026-05-14', time: '13:45' },
    { id: 8, agentName: '吴强', agentPhone: '13299990000', promotedPhone: '15599990000', remark: '社区推广', date: '2026-05-13', time: '10:10' },
];

// 当前代理信息（模拟当前登录的代理）
const currentAgent = {
    name: '王经理',
    phone: '13888888888'
};

// 当前推广类型（个人/团队）
let currentPromotionType = 'personal';

// 当前列表页面Tab类型
let currentListTabType = 'all';

// 初始化推广记录功能
function initPromotionRecords() {
    // 推广类型切换按钮
    const toggleBtns = document.querySelectorAll('.promotion-toggle-btns .toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            switchPromotionType(type);
        });
    });

    // 查看更多链接点击事件
    const viewMoreLink = document.querySelector('[data-page="promotion-list-page"]');
    if (viewMoreLink) {
        viewMoreLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('promotion-list-page');
            renderPromotionListFull();
        });
    }

    // 添加推广按钮
    const addBtn = document.querySelector('[data-action="show-add-promotion"]');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            openAddPromotionModal();
        });
    }

    // 推广记录列表页面
    const promotionListPage = document.getElementById('promotion-list-page');
    if (promotionListPage) {
        // 列表Tab按钮
        const listTabBtns = promotionListPage.querySelectorAll('.list-tab-btn');
        listTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-list-type');
                switchListTabType(type);
            });
        });

        // 搜索功能
        const searchInput = promotionListPage.querySelector('#promotion-search-input');
        const searchBtn = promotionListPage.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => renderPromotionListFull());
        }
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') renderPromotionListFull();
            });
        }

        // 日期筛选
        const filterBtn = promotionListPage.querySelector('[data-action="filter-promotions"]');
        if (filterBtn) {
            filterBtn.addEventListener('click', () => renderPromotionListFull());
        }
    }

    // 添加推广弹窗
    const addModal = document.getElementById('add-promotion-modal');
    if (addModal) {
        const closeBtn = addModal.querySelectorAll('[data-action="close-add-promotion"]');
        closeBtn.forEach(btn => {
            btn.addEventListener('click', () => closeAddPromotionModal());
        });
        addModal.querySelector('.modal-overlay').addEventListener('click', () => closeAddPromotionModal());

        // 确认添加
        const confirmBtn = addModal.querySelector('[data-action="confirm-add-promotion"]');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => confirmAddPromotion());
        }
    }

    // 初始渲染
    renderPromotionList();
    updatePromotionStats();
}

// 切换推广类型
function switchPromotionType(type) {
    currentPromotionType = type;
    
    // 更新按钮状态
    const toggleBtns = document.querySelectorAll('.promotion-toggle-btns .toggle-btn');
    toggleBtns.forEach(btn => {
        if (btn.getAttribute('data-type') === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 更新统计数据
    updatePromotionStats();
}

// 切换列表Tab类型
function switchListTabType(type) {
    currentListTabType = type;
    
    // 更新按钮状态
    const listTabBtns = document.querySelectorAll('.list-tab-btn');
    listTabBtns.forEach(btn => {
        if (btn.getAttribute('data-list-type') === type) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // 重新渲染列表和统计数据
    renderPromotionListFull();
}

// 更新列表页面统计数据
function updateListStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 根据当前选择的类型过滤数据
    let filteredRecords = promotionRecords;
    if (currentListTabType === 'personal') {
        filteredRecords = promotionRecords.filter(r => r.agentPhone === currentAgent.phone);
    } else if (currentListTabType === 'team') {
        // 团队数据，我们这里简单处理，假设团队就是全部数据，先过滤其他推广代理数据（假设是团队团队数据是全部的数据是全部团队全部团队数据
    }
    
    const thisMonth = filteredRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;
    
    const total = filteredRecords.length;
    
    const monthEl = document.getElementById('list-month-promotion');
    const totalEl = document.getElementById('list-total-promotion');
    
    if (monthEl) monthEl.textContent = thisMonth;
    if (totalEl) totalEl.textContent = total;
}

function renderPromotionList() {
    const container = document.getElementById('promotion-list-container');
    if (!container) return;

    const displayRecords = promotionRecords.slice(0, 3);
    
    container.innerHTML = displayRecords.map(record => {
        const maskedAgentPhone = record.agentPhone.slice(0, 3) + '****' + record.agentPhone.slice(7);
        const maskedPromotedPhone = record.promotedPhone.slice(0, 3) + '****' + record.promotedPhone.slice(7);
        return `
            <div class="promotion-item">
                <div class="promotion-left">
                    <div class="promotion-avatar">${record.agentName[0]}</div>
                    <div class="promotion-info">
                        <div class="promotion-name-row">
                            <span class="promotion-name">${record.agentName}</span>
                            <span class="promotion-phone">${maskedAgentPhone}</span>
                        </div>
                        <div class="promotion-detail-row">
                            <span class="detail-label">被推广人：</span>
                            <span class="detail-value">${maskedPromotedPhone}</span>
                        </div>
                        ${record.remark ? `
                        <div class="promotion-remark">${record.remark}</div>
                        ` : ''}
                    </div>
                </div>
                <div class="promotion-right">
                    <div class="promotion-date">${record.date}</div>
                    <div class="promotion-time">${record.time}</div>
                </div>
            </div>
        `;
    }).join('');

    updatePromotionStats();
}

function renderPromotionListFull() {
    const container = document.getElementById('promotion-list-full');
    if (!container) return;

    const promotionListPage = document.getElementById('promotion-list-page');
    const searchTerm = promotionListPage.querySelector('#promotion-search-input')?.value?.toLowerCase() || '';
    const startDate = promotionListPage.querySelector('#promotion-start-date')?.value || '';
    const endDate = promotionListPage.querySelector('#promotion-end-date')?.value || '';

    // 先根据tab类型过滤
    let filtered = promotionRecords;
    if (currentListTabType === 'personal') {
        filtered = promotionRecords.filter(r => r.agentPhone === currentAgent.phone);
    } else if (currentListTabType === 'team') {
        // 团队数据可以在这里进一步处理
        // 暂时使用全部数据，或者添加其他过滤逻辑
    }

    // 再应用搜索和日期筛选
    filtered = filtered.filter(record => {
        if (searchTerm && !record.agentName.toLowerCase().includes(searchTerm) && !record.agentPhone.includes(searchTerm) && !record.promotedPhone.includes(searchTerm)) return false;
        if (startDate && record.date < startDate) return false;
        if (endDate && record.date > endDate) return false;
        return true;
    });

    container.innerHTML = filtered.map(record => {
        const maskedAgentPhone = record.agentPhone.slice(0, 3) + '****' + record.agentPhone.slice(7);
        const maskedPromotedPhone = record.promotedPhone.slice(0, 3) + '****' + record.promotedPhone.slice(7);
        return `
            <div class="promotion-item">
                <div class="promotion-left">
                    <div class="promotion-avatar">${record.agentName[0]}</div>
                    <div class="promotion-info">
                        <div class="promotion-name-row">
                            <span class="promotion-name">${record.agentName}</span>
                            <span class="promotion-phone">${maskedAgentPhone}</span>
                        </div>
                        <div class="promotion-detail-row">
                            <span class="detail-label">被推广人：</span>
                            <span class="detail-value">${maskedPromotedPhone}</span>
                        </div>
                        ${record.remark ? `
                        <div class="promotion-remark">${record.remark}</div>
                        ` : ''}
                    </div>
                </div>
                <div class="promotion-right">
                    <div class="promotion-date">${record.date}</div>
                    <div class="promotion-time">${record.time}</div>
                </div>
            </div>
        `;
    }).join('');

    updateListStats();
}

function openAddPromotionModal() {
    const modal = document.getElementById('add-promotion-modal');
    document.getElementById('promoted-phone').value = '';
    document.getElementById('promoted-remark').value = '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAddPromotionModal() {
    const modal = document.getElementById('add-promotion-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function confirmAddPromotion() {
    const promotedPhone = document.getElementById('promoted-phone').value.trim();
    const remark = document.getElementById('promoted-remark').value.trim();

    if (!promotedPhone) {
        alert('请输入被推广人手机号');
        return;
    }

    if (!/^1[3-9]\d{9}$/.test(promotedPhone)) {
        alert('请输入有效的手机号');
        return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);

    const newRecord = {
        id: promotionRecords.length + 1,
        agentName: currentAgent.name,
        agentPhone: currentAgent.phone,
        promotedPhone: promotedPhone,
        remark: remark,
        date: date,
        time: time
    };

    promotionRecords.unshift(newRecord);
    
    console.log('添加推广记录:', newRecord);
    alert('推广记录添加成功！');
    closeAddPromotionModal();
    renderPromotionList();
}

function updatePromotionStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 根据当前选择的类型筛选数据
    const filteredRecords = currentPromotionType === 'personal' 
        ? promotionRecords.filter(r => r.agentPhone === currentAgent.phone)
        : promotionRecords;
    
    const thisMonth = filteredRecords.filter(r => {
        const recordDate = new Date(r.date);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;
    
    const total = filteredRecords.length;
    
    const monthEl = document.getElementById('month-promotion');
    const totalEl = document.getElementById('total-promotion');
    
    if (monthEl) monthEl.textContent = thisMonth;
    if (totalEl) totalEl.textContent = total;
}

// 代理数据
let agents = [
    { id: 1, name: '张明', phone: '13912341234', subAgents: 5, status: 'active' },
    { id: 2, name: '李华', phone: '13856785678', subAgents: 8, status: 'active' },
    { id: 3, name: '王芳', phone: '13790129012', subAgents: 2, status: 'disabled' },
];

let selectedAgentForSettings = null;
let agentSettings = {};

// 初始化代理管理功能
function initAgentManagement() {
    const agentList = document.getElementById('agent-list-container');
    
    if (agentList) {
        agentList.addEventListener('click', (e) => {
            const target = e.target;
            const agentItem = target.closest('.agent-item');
            
            if (!agentItem) return;
            
            const agentId = agentItem.dataset.agentId;
            const agent = agents.find(a => a.id == agentId);
            
            if (!agent) return;
            
            if (target.classList.contains('settings')) {
                openAgentSettingsModal(agent);
            } else if (target.classList.contains('edit')) {
                window.openAgentModal('edit', {
                    name: agent.name,
                    phone: agent.phone
                });
            } else if (target.classList.contains('disable')) {
                if (confirm(`确定要禁用代理 ${agent.name} 吗？`)) {
                    agent.status = 'disabled';
                    updateAgentList();
                    updateAgentStats();
                    alert('禁用成功！');
                }
            } else if (target.classList.contains('enable')) {
                if (confirm(`确定要启用代理 ${agent.name} 吗？`)) {
                    agent.status = 'active';
                    updateAgentList();
                    updateAgentStats();
                    alert('启用成功！');
                }
            }
        });
    }
    
    // 打开代理设置按钮
    const openSettingsBtn = document.querySelector('[data-action="open-agent-settings"]');
    if (openSettingsBtn) {
        openSettingsBtn.addEventListener('click', () => {
            alert('请从上方代理列表中点击"设置"按钮选择要设置的代理');
        });
    }
    
    // 关闭代理设置弹窗
    const settingsModal = document.getElementById('agent-settings-modal');
    const closeBtn = settingsModal.querySelector('[data-action="close-agent-settings"]');
    closeBtn.addEventListener('click', () => closeAgentSettingsModal());
    settingsModal.querySelector('.modal-overlay').addEventListener('click', () => closeAgentSettingsModal());
    
    // 保存设置
    const saveBtn = settingsModal.querySelector('[data-action="save-agent-settings"]');
    saveBtn.addEventListener('click', () => saveAgentSettings());
    
    // 添加代理奖励规则
    const addRuleBtn = settingsModal.querySelector('[data-action="add-agent-rule"]');
    if (addRuleBtn) {
        addRuleBtn.addEventListener('click', () => {
            alert('添加奖励规则功能开发中...');
        });
    }
    
    // 编辑和删除奖励规则
    const rewardRulesContainer = document.getElementById('agent-reward-rules');
    if (rewardRulesContainer) {
        rewardRulesContainer.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('rule-edit')) {
                alert('编辑奖励规则功能开发中...');
            } else if (target.classList.contains('rule-delete')) {
                const ruleItem = target.closest('.reward-rule');
                if (confirm('确定要删除这条奖励规则吗？')) {
                    ruleItem.remove();
                }
            }
        });
    }
    
    updateAgentStats();
}

function openAgentSettingsModal(agent) {
    selectedAgentForSettings = agent;
    const modal = document.getElementById('agent-settings-modal');
    
    // 设置标题
    document.getElementById('agent-settings-title').textContent = `${agent.name} 的设置`;
    
    // 设置代理信息
    const infoAvatar = modal.querySelector('.info-avatar');
    const infoName = modal.querySelector('.info-name');
    const infoPhone = modal.querySelector('.info-phone');
    
    infoAvatar.textContent = agent.name[0];
    infoName.textContent = agent.name;
    infoPhone.textContent = agent.phone.slice(0, 3) + '****' + agent.phone.slice(7);
    
    // 设置代理ID
    document.getElementById('settings-agent-id').value = agent.id;
    
    // 加载或初始化代理设置
    if (!agentSettings[agent.id]) {
        agentSettings[agent.id] = {
            yearPrice: 199,
            monthPrice: 99,
            timesPrice: 9.9,
            rewardRules: [
                { min: 0, max: 10, amount: 1 },
                { min: 10, max: 100, amount: 2 },
                { min: 100, max: null, amount: 3 }
            ]
        };
    }
    
    const settings = agentSettings[agent.id];
    
    // 填充价格
    document.getElementById('year-price').value = settings.yearPrice;
    document.getElementById('month-price').value = settings.monthPrice;
    document.getElementById('times-price').value = settings.timesPrice;
    
    // 渲染奖励规则
    renderAgentRewardRules(settings.rewardRules);
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAgentSettingsModal() {
    const modal = document.getElementById('agent-settings-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedAgentForSettings = null;
}

function renderAgentRewardRules(rules) {
    const container = document.getElementById('agent-reward-rules');
    if (!container) return;
    
    container.innerHTML = rules.map((rule, index) => {
        let rangeText = rule.max === null ? `${rule.min}人以上` : `${rule.min} - ${rule.max}人`;
        return `
            <div class="reward-rule">
                <div class="rule-range">${rangeText}</div>
                <div class="rule-amount">¥${rule.amount.toFixed(2)}/人</div>
                <div class="rule-actions">
                    <button type="button" class="rule-edit">编辑</button>
                    <button type="button" class="rule-delete">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function saveAgentSettings() {
    if (!selectedAgentForSettings) return;
    
    const agentId = selectedAgentForSettings.id;
    const yearPrice = parseFloat(document.getElementById('year-price').value);
    const monthPrice = parseFloat(document.getElementById('month-price').value);
    const timesPrice = parseFloat(document.getElementById('times-price').value);
    
    if (isNaN(yearPrice) || isNaN(monthPrice) || isNaN(timesPrice)) {
        alert('请输入有效的价格');
        return;
    }
    
    agentSettings[agentId] = {
        yearPrice,
        monthPrice,
        timesPrice,
        rewardRules: agentSettings[agentId]?.rewardRules || []
    };
    
    console.log('保存代理设置:', selectedAgentForSettings.name, agentSettings[agentId]);
    alert(`${selectedAgentForSettings.name}的设置已保存！`);
    closeAgentSettingsModal();
}

function updateAgentList() {
    const container = document.getElementById('agent-list-container');
    if (!container) return;
    
    container.innerHTML = agents.map(agent => {
        const statusClass = agent.status === 'active' ? 'active' : 'disabled';
        const statusText = agent.status === 'active' ? '正常' : '已禁用';
        const actionText = agent.status === 'active' ? '禁用' : '启用';
        const actionClass = agent.status === 'active' ? 'disable' : 'enable';
        
        return `
            <div class="agent-item" data-agent-id="${agent.id}">
                <div class="agent-avatar">${agent.name[0]}</div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-phone">${agent.phone.slice(0, 3)}****${agent.phone.slice(7)}</div>
                    <div class="agent-sub-count">一级代理: ${agent.subAgents}人</div>
                </div>
                <div class="agent-status ${statusClass}">${statusText}</div>
                <div class="agent-actions">
                    <button class="action-btn settings" data-action="agent-settings">设置</button>
                    <button class="action-btn edit">编辑</button>
                    <button class="action-btn ${actionClass}">${actionText}</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateAgentStats() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // 模拟本月发展代理数
    const monthNewAgents = 3;
    
    // 下级代理数（所有代理的直接下级）
    const subAgents = agents.reduce((sum, agent) => sum + agent.subAgents, 0);
    
    // 团队代理数
    const teamAgents = agents.length;
    
    const monthEl = document.getElementById('month-new-agents');
    const subEl = document.getElementById('sub-agents');
    const teamEl = document.getElementById('team-agents');
    
    if (monthEl) monthEl.textContent = monthNewAgents;
    if (subEl) subEl.textContent = subAgents;
    if (teamEl) teamEl.textContent = teamAgents;
}

// 采购管理数据
let purchaseOrders = [
    {
        id: 1,
        orderNo: 'PUR20240520001',
        status: 'completed',
        totalAmount: 398,
        cardCount: 2,
        cards: [
            { id: 1, number: '888866660006', type: 'year', expiry: '2025-05-20' }
        ],
        paymentMethod: '微信支付',
        paymentDate: '2024-05-20 14:30',
        createdAt: '2024-05-20 14:28'
    },
    {
        id: 2,
        orderNo: 'PUR20240518002',
        status: 'shipped',
        totalAmount: 199,
        cardCount: 1,
        cards: [
            { id: 2, number: '888866660007', type: 'year', expiry: '2025-05-18' }
        ],
        paymentMethod: '支付宝',
        paymentDate: '2024-05-18 10:15',
        createdAt: '2024-05-18 10:12'
    },
    {
        id: 3,
        orderNo: 'PUR20240515003',
        status: 'pending',
        totalAmount: 99,
        cardCount: 1,
        cards: [
            { id: 3, number: '888866660008', type: 'month', expiry: '2024-06-15' }
        ],
        paymentMethod: '',
        paymentDate: '',
        createdAt: '2024-05-15 16:45'
    }
];

// 可购买的电影卡
let availableCards = [
    { id: 1001, type: 'year', price: 199, expiry: '2025-12-31', name: 'VIP电影年卡' },
    { id: 1002, type: 'month', price: 99, expiry: '2024-06-30', name: 'VIP电影月卡' },
    { id: 1003, type: 'times', price: 9.9, expiry: '2024-08-31', name: 'VIP电影次卡' }
];

// 我的电影卡
let myCards = [];

// 当前选中的采购订单
let selectedPurchaseOrder = null;

// 当前选中的购买信息
let selectedBuyCard = null;
let selectedPaymentMethod = null;

// 采购状态映射
const purchaseStatusMap = {
    pending: '待支付',
    shipped: '已发货',
    received: '已收货',
    completed: '已完成'
};

// 初始化采购管理功能
function initPurchaseManagement() {
    renderPurchaseList();
    updatePurchaseStats();
    
    // 立即采购按钮
    const addBtn = document.querySelector('[data-action="show-purchase-list"]');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            navigateTo('purchase-card-page');
            renderPurchaseCardList();
        });
    }
    
    // 采购列表项点击事件
    const purchaseListContainer = document.getElementById('purchase-list-container');
    if (purchaseListContainer) {
        purchaseListContainer.addEventListener('click', (e) => {
            const purchaseItem = e.target.closest('.purchase-item');
            if (purchaseItem) {
                const orderId = purchaseItem.dataset.orderId;
                const order = purchaseOrders.find(o => o.id == orderId);
                if (order) {
                    navigateToPurchaseDetail(order);
                }
            }
        });
    }
    
    // 采购筛选标签
    const purchaseListPage = document.getElementById('purchase-list-page');
    if (purchaseListPage) {
        const filterTabs = purchaseListPage.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderPurchaseListFull();
            });
        });
    }
}

// 渲染采购列表
function renderPurchaseList() {
    const container = document.getElementById('purchase-list-container');
    if (!container) return;
    
    const displayOrders = purchaseOrders.slice(0, 3);
    
    container.innerHTML = displayOrders.map(order => {
        const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
        const card = order.cards[0];
        
        return `
            <div class="purchase-item" data-order-id="${order.id}">
                <div class="purchase-header">
                    <span class="purchase-order-no">${order.orderNo}</span>
                    <span class="purchase-status-badge ${order.status}">${purchaseStatusMap[order.status]}</span>
                </div>
                <div class="purchase-content">
                    <div class="purchase-card-preview">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                    </div>
                    <div class="purchase-details">
                        <div class="purchase-card-count">${order.cardCount}张${typeMap[card.type]}</div>
                        <div class="purchase-total">¥${order.totalAmount.toFixed(2)}</div>
                        <div class="purchase-date">${order.createdAt}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染完整采购列表
function renderPurchaseListFull() {
    const container = document.getElementById('purchase-list-full');
    if (!container) return;
    
    const purchaseListPage = document.getElementById('purchase-list-page');
    const activeFilter = purchaseListPage.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    
    let filteredOrders = purchaseOrders;
    if (activeFilter !== 'all') {
        filteredOrders = purchaseOrders.filter(o => o.status === activeFilter);
    }
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = filteredOrders.map(order => {
        const card = order.cards[0];
        return `
            <div class="purchase-item" data-order-id="${order.id}">
                <div class="purchase-header">
                    <span class="purchase-order-no">${order.orderNo}</span>
                    <span class="purchase-status-badge ${order.status}">${purchaseStatusMap[order.status]}</span>
                </div>
                <div class="purchase-content">
                    <div class="purchase-card-preview">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                    </div>
                    <div class="purchase-details">
                        <div class="purchase-card-count">${order.cardCount}张${typeMap[card.type]}</div>
                        <div class="purchase-total">¥${order.totalAmount.toFixed(2)}</div>
                        <div class="purchase-date">${order.createdAt}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.purchase-item').forEach(item => {
        item.addEventListener('click', () => {
            const orderId = item.dataset.orderId;
            const order = purchaseOrders.find(o => o.id == orderId);
            if (order) {
                navigateToPurchaseDetail(order);
            }
        });
    });
}

// 更新采购统计
function updatePurchaseStats() {
    const totalOrders = purchaseOrders.length;
    const totalEl = document.getElementById('total-orders');
    if (totalEl) totalEl.textContent = totalOrders;
}

// 打开采购详情弹窗
function openPurchaseDetailModal(order) {
    selectedPurchaseOrder = order;
    const modal = document.getElementById('purchase-detail-modal');
    const container = document.getElementById('purchase-detail-info');
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = `
        <div class="purchase-detail-header">
            <div class="purchase-detail-row">
                <span class="purchase-detail-label">订单号</span>
                <span class="purchase-detail-value">${order.orderNo}</span>
            </div>
            <div class="purchase-detail-row">
                <span class="purchase-detail-label">订单状态</span>
                <span class="purchase-detail-value">${purchaseStatusMap[order.status]}</span>
            </div>
            <div class="purchase-detail-row">
                <span class="purchase-detail-label">订单金额</span>
                <span class="purchase-detail-value">¥${order.totalAmount.toFixed(2)}</span>
            </div>
            ${order.paymentMethod ? `
            <div class="purchase-detail-row">
                <span class="purchase-detail-label">支付方式</span>
                <span class="purchase-detail-value">${order.paymentMethod}</span>
            </div>
            ` : ''}
            ${order.paymentDate ? `
            <div class="purchase-detail-row">
                <span class="purchase-detail-label">支付时间</span>
                <span class="purchase-detail-value">${order.paymentDate}</span>
            </div>
            ` : ''}
            <div class="purchase-detail-row">
                <span class="purchase-detail-label">下单时间</span>
                <span class="purchase-detail-value">${order.createdAt}</span>
            </div>
        </div>
        ${order.status !== 'pending' ? `
        <div class="purchase-detail-cards">
            <div class="purchase-detail-section-title">电影卡信息</div>
            <div class="purchase-card-list">
                ${order.cards.slice(0, 3).map(card => `
                <div class="purchase-card-list-item">
                    <div class="purchase-card-image">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                    </div>
                    <div class="purchase-card-info">
                        <div class="purchase-card-no">${card.number}</div>
                        <div class="purchase-card-type">${typeMap[card.type]}</div>
                        <div class="purchase-card-expiry">有效期至: ${card.expiry}</div>
                    </div>
                </div>
                `).join('')}
            </div>
            ${order.cards.length > 3 ? `
            <button class="view-all-cards-btn" data-action="view-my-cards">查看全部 ${order.cards.length} 张</button>
            ` : ''}
        </div>
        ` : ''}
    `;
    
    // 查看全部按钮
    const viewAllBtn = container.querySelector('[data-action="view-my-cards"]');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            myCards = [...order.cards];
            closePurchaseDetailModal();
            navigateTo('my-cards-page');
            renderMyCards();
        });
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 跳转到采购详情页面
function navigateToPurchaseDetail(order) {
    selectedPurchaseOrder = order;
    navigateTo('purchase-detail-page');
}

// 渲染采购详情页面
function renderPurchaseDetail() {
    if (!selectedPurchaseOrder) return;
    
    const order = selectedPurchaseOrder;
    const container = document.getElementById('purchase-detail-content');
    if (!container) return;
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    const statusMap = { pending: '待支付', shipped: '已发货', received: '已收货', completed: '已完成' };
    const statusClassMap = { pending: 'pending', shipped: 'shipped', received: 'received', completed: 'completed' };
    
    container.innerHTML = `
        <div class="purchase-detail-card">
            <div class="purchase-detail-title">订单信息</div>
            <div class="purchase-detail-section">
                <div class="purchase-detail-label">订单号</div>
                <div class="purchase-detail-value">${order.orderNo}</div>
            </div>
            <div class="purchase-detail-section">
                <div class="purchase-detail-label">订单状态</div>
                <div class="purchase-detail-value">
                    <span class="purchase-detail-status-badge ${statusClassMap[order.status]}">${statusMap[order.status]}</span>
                </div>
            </div>
            <div class="purchase-detail-section">
                <div class="purchase-detail-label">订单金额</div>
                <div class="purchase-detail-value">¥${order.totalAmount.toFixed(2)}</div>
            </div>
            ${order.paymentMethod ? `
            <div class="purchase-detail-section">
                <div class="purchase-detail-label">支付方式</div>
                <div class="purchase-detail-value">${order.paymentMethod}</div>
            </div>
            ` : ''}
            ${order.paymentDate ? `
            <div class="purchase-detail-section">
                <div class="purchase-detail-label">支付时间</div>
                <div class="purchase-detail-value">${order.paymentDate}</div>
            </div>
            ` : ''}
            <div class="purchase-detail-section">
                <div class="purchase-detail-label">下单时间</div>
                <div class="purchase-detail-value">${order.createdAt}</div>
            </div>
        </div>
        ${order.status !== 'pending' ? `
        <div class="purchase-detail-card">
            <div class="purchase-detail-title">电影卡信息</div>
            <div class="purchase-detail-cards-section">
                ${order.cards.slice(0, 3).map(card => `
                <div class="purchase-detail-card-item">
                    <div class="purchase-detail-card-img-wrapper">
                        <span>🎬</span>
                    </div>
                    <div class="purchase-detail-card-info">
                        <div class="purchase-detail-card-number">${card.number}</div>
                        <div class="purchase-detail-card-type">${typeMap[card.type]}</div>
                        <div class="purchase-detail-card-expiry">有效期至: ${card.expiry}</div>
                    </div>
                </div>
                `).join('')}
                ${order.cards.length > 3 ? `
                <button class="purchase-detail-view-all-btn" data-action="view-all-cards">查看全部 ${order.cards.length} 张</button>
                ` : ''}
            </div>
        </div>
        ` : ''}
    `;
    
    // 查看全部按钮
    const viewAllBtn = container.querySelector('[data-action="view-all-cards"]');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            myCards = [...order.cards];
            navigateTo('my-cards-page');
            renderMyCards();
        });
    }
}

// 关闭采购详情弹窗
function closePurchaseDetailModal() {
    const modal = document.getElementById('purchase-detail-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedPurchaseOrder = null;
}

// 渲染购买电影卡列表
function renderPurchaseCardList() {
    const container = document.getElementById('purchase-card-list');
    if (!container) return;
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = availableCards.map(card => `
        <div class="purchase-card-item" data-card-id="${card.id}">
            <div class="purchase-card-header">
                <div class="purchase-card-img">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%230f3460' width='100' height='100' rx='12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='32' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                </div>
                <div class="purchase-card-main">
                    <div class="purchase-card-title">${card.name}</div>
                    <span class="purchase-card-type-badge ${card.type}">${typeMap[card.type]}</span>
                    <div class="purchase-card-price">¥${card.price.toFixed(2)}</div>
                    <div class="purchase-card-expiry">有效期至: ${card.expiry}</div>
                </div>
            </div>
            <div class="purchase-card-footer">
                <div class="quantity-selector">
                    <button class="quantity-btn" data-action="decrease">-</button>
                    <span class="quantity-value">1</span>
                    <button class="quantity-btn" data-action="increase">+</button>
                </div>
                <button class="buy-btn" data-action="buy-card">立即购买</button>
            </div>
        </div>
    `).join('');
    
    // 绑定数量调整事件
    container.querySelectorAll('.purchase-card-item').forEach(item => {
        const cardId = item.dataset.cardId;
        const card = availableCards.find(c => c.id == cardId);
        
        const decreaseBtn = item.querySelector('[data-action="decrease"]');
        const increaseBtn = item.querySelector('[data-action="increase"]');
        const quantityValue = item.querySelector('.quantity-value');
        const buyBtn = item.querySelector('[data-action="buy-card"]');
        
        let quantity = 1;
        
        decreaseBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityValue.textContent = quantity;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            quantity++;
            quantityValue.textContent = quantity;
        });
        
        buyBtn.addEventListener('click', () => {
            openPurchaseConfirmModal(card, quantity);
        });
    });
}

// 打开购买确认弹窗
function openPurchaseConfirmModal(card, quantity) {
    selectedBuyCard = { ...card, quantity };
    selectedPaymentMethod = null;
    const modal = document.getElementById('purchase-confirm-modal');
    const container = document.getElementById('purchase-confirm-info');
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    const total = card.price * quantity;
    
    container.innerHTML = `
        <div class="purchase-confirm-card">
            <div class="purchase-confirm-img">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
            </div>
            <div class="purchase-confirm-details">
                <div class="purchase-confirm-title">${card.name}</div>
                <div class="purchase-confirm-quantity">数量: ${quantity}张</div>
                <div class="purchase-confirm-price">¥${total.toFixed(2)}</div>
            </div>
        </div>
        <div class="payment-method-selector">
            <div class="payment-method-label">选择支付方式</div>
            <div class="payment-method-option" data-method="wechat">
                <div class="payment-method-radio"></div>
                <div class="payment-method-name">微信支付</div>
                <div class="payment-method-icon">💬</div>
            </div>
            <div class="payment-method-option" data-method="alipay">
                <div class="payment-method-radio"></div>
                <div class="payment-method-name">支付宝</div>
                <div class="payment-method-icon">💰</div>
            </div>
            <div class="payment-method-option" data-method="bank">
                <div class="payment-method-radio"></div>
                <div class="payment-method-name">银行卡</div>
                <div class="payment-method-icon">💳</div>
            </div>
        </div>
    `;
    
    // 绑定支付方式选择
    container.querySelectorAll('.payment-method-option').forEach(option => {
        option.addEventListener('click', () => {
            container.querySelectorAll('.payment-method-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedPaymentMethod = option.dataset.method;
        });
    });
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭购买确认弹窗
function closePurchaseConfirmModal() {
    const modal = document.getElementById('purchase-confirm-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedBuyCard = null;
    selectedPaymentMethod = null;
}

// 提交购买
function submitPurchase() {
    if (!selectedBuyCard) {
        alert('请选择要购买的商品');
        return;
    }
    
    if (!selectedPaymentMethod) {
        alert('请选择支付方式');
        return;
    }
    
    const paymentMethodMap = {
        wechat: '微信支付',
        alipay: '支付宝',
        bank: '银行卡'
    };
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    const paymentDate = `${date} ${time}`;
    
    // 生成新订单
    const newOrder = {
        id: purchaseOrders.length + 1,
        orderNo: `PUR${date.replace(/-/g, '')}${String(purchaseOrders.length + 1).padStart(3, '0')}`,
        status: 'completed',
        totalAmount: selectedBuyCard.price * selectedBuyCard.quantity,
        cardCount: selectedBuyCard.quantity,
        cards: [],
        paymentMethod: paymentMethodMap[selectedPaymentMethod],
        paymentDate: paymentDate,
        createdAt: paymentDate
    };
    
    // 生成电影卡
    for (let i = 0; i < selectedBuyCard.quantity; i++) {
        newOrder.cards.push({
            id: Date.now() + i,
            number: `8888${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
            type: selectedBuyCard.type,
            expiry: selectedBuyCard.expiry
        });
    }
    
    purchaseOrders.unshift(newOrder);
    
    console.log('创建订单:', newOrder);
    alert('购买成功！');
    closePurchaseConfirmModal();
    navigateTo('purchase-management-page');
    renderPurchaseList();
    updatePurchaseStats();
}

// 渲染我的电影卡
function renderMyCards() {
    const container = document.getElementById('my-cards-list');
    if (!container) return;
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = myCards.map(card => `
        <div class="my-card-item">
            <div class="my-card-image">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect fill='%230f3460' width='80' height='80' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='24' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
            </div>
            <div class="my-card-info">
                <div class="my-card-no">${card.number}</div>
                <div class="my-card-type">${typeMap[card.type]}</div>
                <div class="my-card-expiry">有效期至: ${card.expiry}</div>
                <span class="my-card-status unsold">未使用</span>
            </div>
        </div>
    `).join('');
}

function initWithdrawProcessPage() {
    currentProcessFilter = 'all';
    const filterTabs = document.querySelectorAll('.withdraw-process-filter .filter-tab');
    filterTabs.forEach(t => t.classList.remove('active'));
    filterTabs[0]?.classList.add('active');
    updateWithdrawProcessStats();
    renderWithdrawProcessList();
}

function updateWithdrawProcessStats() {
    const pending = subAgentWithdrawRecords.filter(r => r.status === 'pending').length;
    const success = subAgentWithdrawRecords.filter(r => r.status === 'success').length;
    const failed = subAgentWithdrawRecords.filter(r => r.status === 'failed').length;
    
    const pendingEl = document.getElementById('process-pending-count');
    const successEl = document.getElementById('process-success-count');
    const failedEl = document.getElementById('process-failed-count');
    
    if (pendingEl) pendingEl.textContent = pending;
    if (successEl) successEl.textContent = success;
    if (failedEl) failedEl.textContent = failed;
    
    const countEl = document.getElementById('pending-withdraw-count');
    if (countEl) countEl.textContent = pending > 0 ? `待审核 ${pending} 条` : '暂无待审核';
}

function renderWithdrawProcessList() {
    const container = document.getElementById('withdraw-process-list');
    if (!container) return;
    
    const statusMap = { success: '提现成功', pending: '待审核', failed: '提现失败' };
    let filtered = subAgentWithdrawRecords;
    if (currentProcessFilter !== 'all') {
        filtered = subAgentWithdrawRecords.filter(r => r.status === currentProcessFilter);
    }
    
    container.innerHTML = filtered.length === 0 ? '<div class="empty-tip">暂无提现记录</div>' : filtered.map(record => `
        <div class="process-record-item">
            <div class="process-record-header">
                <div class="process-record-order">单号：${record.orderNo}</div>
                <span class="withdraw-status ${record.status}">${statusMap[record.status]}</span>
            </div>
            <div class="process-record-body">
                <div class="process-record-agent">
                    <div class="process-agent-avatar">${record.agentName[0]}</div>
                    <div class="process-agent-info">
                        <div class="process-agent-name">${record.agentName}</div>
                        <div class="process-agent-phone">${record.agentPhone}</div>
                    </div>
                </div>
                <div class="process-record-amount">
                    <div class="process-amount-value">¥${record.amount.toFixed(2)}</div>
                    <div class="process-amount-label">实转：¥${record.realAmount.toFixed(2)}</div>
                </div>
            </div>
            <div class="process-record-footer">
                <div class="process-record-meta">
                    <span class="process-meta-text">${record.method} · ${record.time}</span>
                    ${record.remark ? `<span class="process-meta-text">备注：${record.remark}</span>` : ''}
                </div>
                ${record.status === 'pending' ? `<button class="process-action-btn" data-action="review-withdraw" data-id="${record.id}">立即处理</button>` : ''}
            </div>
        </div>
    `).join('');
    
    container.querySelectorAll('[data-action="review-withdraw"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId = parseInt(btn.dataset.id);
            openWithdrawReviewModal(recordId);
        });
    });
}

function openWithdrawReviewModal(recordId) {
    const record = subAgentWithdrawRecords.find(r => r.id === recordId);
    if (!record) return;
    
    currentReviewRecord = record;
    currentReviewResult = 'success';
    
    document.getElementById('review-order-no').textContent = record.orderNo;
    document.getElementById('review-agent-name').textContent = record.agentName;
    document.getElementById('review-agent-phone').textContent = record.agentPhone;
    document.getElementById('review-amount').textContent = `¥${record.amount.toFixed(2)}`;
    document.getElementById('review-real-amount').textContent = `¥${record.realAmount.toFixed(2)}`;
    document.getElementById('review-method').textContent = record.method;
    document.getElementById('review-time').textContent = record.time;
    document.getElementById('review-remark').value = '';
    
    const resultItems = document.querySelectorAll('.review-result-item');
    resultItems.forEach(item => {
        item.classList.remove('selected');
        item.querySelector('.result-radio').classList.remove('checked');
    });
    resultItems[0]?.classList.add('selected');
    resultItems[0]?.querySelector('.result-radio').classList.add('checked');
    
    const modal = document.getElementById('withdraw-review-modal');
    if (modal) modal.classList.add('active');
}

function closeWithdrawReviewModal() {
    const modal = document.getElementById('withdraw-review-modal');
    if (modal) modal.classList.remove('active');
    currentReviewRecord = null;
}

function submitWithdrawReview() {
    if (!currentReviewRecord) return;
    
    const remark = document.getElementById('review-remark')?.value || '';
    
    const record = subAgentWithdrawRecords.find(r => r.id === currentReviewRecord.id);
    if (record) {
        record.status = currentReviewResult;
        record.remark = remark || (currentReviewResult === 'success' ? '审核通过' : '审核拒绝');
    }
    
    closeWithdrawReviewModal();
    updateWithdrawProcessStats();
    renderWithdrawProcessList();
}

// 销售管理数据
let salesOrders = [
    {
        id: 1,
        orderNo: 'SAL20240520001',
        status: 'completed',
        totalAmount: 398,
        cardCount: 2,
        cards: [
            { id: 1, number: '999876543210', type: 'year', expiry: '2025-05-20' }
        ],
        paymentMethod: '微信支付',
        paymentDate: '2024-05-20 14:30',
        createdAt: '2024-05-20 14:28'
    },
    {
        id: 2,
        orderNo: 'SAL20240518002',
        status: 'shipped',
        totalAmount: 199,
        cardCount: 1,
        cards: [
            { id: 2, number: '999876543211', type: 'year', expiry: '2025-05-18' }
        ],
        paymentMethod: '支付宝',
        paymentDate: '2024-05-18 10:15',
        createdAt: '2024-05-18 10:12'
    },
    {
        id: 3,
        orderNo: 'SAL20240515003',
        status: 'pending',
        totalAmount: 99,
        cardCount: 1,
        cards: [
            { id: 3, number: '999876543212', type: 'month', expiry: '2024-06-15' }
        ],
        paymentMethod: '',
        paymentDate: '',
        createdAt: '2024-05-15 16:45'
    }
];

// 可销售的电影卡
let salableCards = [
    { id: 2001, type: 'year', price: 199, expiry: '2025-12-31', name: 'VIP电影年卡' },
    { id: 2002, type: 'month', price: 99, expiry: '2024-06-30', name: 'VIP电影月卡' },
    { id: 2003, type: 'times', price: 9.9, expiry: '2024-08-31', name: 'VIP电影次卡' }
];

// 当前选中的销售订单
let selectedSalesOrder = null;

// 当前选中的购买信息
let selectedSalesCard = null;
let selectedSalesQuantity = 1;

// 销售状态映射
const salesStatusMap = {
    pending: '待支付',
    shipped: '已发货',
    received: '已收货',
    completed: '已完成'
};

// 初始化销售管理功能
function initSalesManagement() {
    renderSalesList();
    updateSalesStats();
    
    // 创建销售订单按钮
    const createBtn = document.querySelector('[data-action="create-sales-order"]');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            navigateTo('sales-card-page');
            renderSalesCardList();
        });
    }
    
    // 销售列表点击事件
    const salesListContainer = document.getElementById('sales-list-container');
    if (salesListContainer) {
        salesListContainer.addEventListener('click', (e) => {
            const salesItem = e.target.closest('.sales-item');
            if (salesItem) {
                const orderId = salesItem.dataset.orderId;
                const order = salesOrders.find(o => o.id == orderId);
                if (order) {
                    openSalesDetailModal(order);
                }
            }
        });
    }
    
    // 销售筛选标签
    const salesListPage = document.getElementById('sales-list-page');
    if (salesListPage) {
        const filterTabs = salesListPage.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderSalesListFull();
            });
        });
    }
    
    // 关闭销售详情弹窗
    const closeSalesDetailBtn = document.querySelector('[data-action="close-sales-detail"]');
    if (closeSalesDetailBtn) {
        closeSalesDetailBtn.addEventListener('click', () => closeSalesDetailModal());
    }
    
    const salesDetailModal = document.getElementById('sales-detail-modal');
    if (salesDetailModal) {
        const overlay = salesDetailModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeSalesDetailModal());
        }
    }
    
    // 关闭销售确认弹窗
    const closeSalesConfirmBtn = document.querySelector('[data-action="close-sales-confirm"]');
    if (closeSalesConfirmBtn) {
        closeSalesConfirmBtn.addEventListener('click', () => closeSalesConfirmModal());
    }
    
    const salesConfirmModal = document.getElementById('sales-confirm-modal');
    if (salesConfirmModal) {
        const overlay = salesConfirmModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeSalesConfirmModal());
        }
    }
    
    // 提交销售订单
    const submitSalesBtn = document.querySelector('[data-action="submit-sales"]');
    if (submitSalesBtn) {
        submitSalesBtn.addEventListener('click', () => submitSales());
    }
    
    // 关闭二维码弹窗
    const closeQrcodeBtn = document.querySelector('[data-action="close-qrcode"]');
    if (closeQrcodeBtn) {
        closeQrcodeBtn.addEventListener('click', () => closeQrcodeModal());
    }
    
    const qrcodeModal = document.getElementById('payment-qrcode-modal');
    if (qrcodeModal) {
        const overlay = qrcodeModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeQrcodeModal());
        }
    }
    
    // 确认支付
    const confirmPaymentBtn = document.querySelector('[data-action="confirm-payment"]');
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', () => confirmPayment());
    }
}

// 渲染销售列表
function renderSalesList() {
    const container = document.getElementById('sales-list-container');
    if (!container) return;
    
    const displayOrders = salesOrders.slice(0, 3);
    
    container.innerHTML = displayOrders.map(order => {
        const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
        const card = order.cards[0];
        
        return `
            <div class="sales-item" data-order-id="${order.id}">
                <div class="sales-header">
                    <span class="sales-order-no">${order.orderNo}</span>
                    <span class="sales-status-badge ${order.status}">${salesStatusMap[order.status]}</span>
                </div>
                <div class="sales-content">
                    <div class="sales-card-preview">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                    </div>
                    <div class="sales-details">
                        <div class="sales-card-count">${order.cardCount}张${typeMap[card.type]}</div>
                        <div class="sales-total">¥${order.totalAmount.toFixed(2)}</div>
                        <div class="sales-date">${order.createdAt}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 渲染完整销售列表
function renderSalesListFull() {
    const container = document.getElementById('sales-list-full');
    if (!container) return;
    
    const salesListPage = document.getElementById('sales-list-page');
    const activeFilter = salesListPage.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    
    let filteredOrders = salesOrders;
    if (activeFilter !== 'all') {
        filteredOrders = salesOrders.filter(o => o.status === activeFilter);
    }
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = filteredOrders.map(order => {
        const card = order.cards[0];
        return `
            <div class="sales-item" data-order-id="${order.id}">
                <div class="sales-header">
                    <span class="sales-order-no">${order.orderNo}</span>
                    <span class="sales-status-badge ${order.status}">${salesStatusMap[order.status]}</span>
                </div>
                <div class="sales-content">
                    <div class="sales-card-preview">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                    </div>
                    <div class="sales-details">
                        <div class="sales-card-count">${order.cardCount}张${typeMap[card.type]}</div>
                        <div class="sales-total">¥${order.totalAmount.toFixed(2)}</div>
                        <div class="sales-date">${order.createdAt}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.sales-item').forEach(item => {
        item.addEventListener('click', () => {
            const orderId = item.dataset.orderId;
            const order = salesOrders.find(o => o.id == orderId);
            if (order) {
                openSalesDetailModal(order);
            }
        });
    });
}

// 更新销售统计
function updateSalesStats() {
    const totalOrders = salesOrders.length;
    const totalEl = document.getElementById('total-sales-orders');
    if (totalEl) totalEl.textContent = totalOrders;
}

// 打开销售详情弹窗
function openSalesDetailModal(order) {
    selectedSalesOrder = order;
    const modal = document.getElementById('sales-detail-modal');
    const container = document.getElementById('sales-detail-info');
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = `
        <div class="sales-detail-header">
            <div class="sales-detail-row">
                <span class="sales-detail-label">订单号</span>
                <span class="sales-detail-value">${order.orderNo}</span>
            </div>
            <div class="sales-detail-row">
                <span class="sales-detail-label">订单状态</span>
                <span class="sales-detail-value">${salesStatusMap[order.status]}</span>
            </div>
            <div class="sales-detail-row">
                <span class="sales-detail-label">订单金额</span>
                <span class="sales-detail-value">¥${order.totalAmount.toFixed(2)}</span>
            </div>
            ${order.paymentMethod ? `
            <div class="sales-detail-row">
                <span class="sales-detail-label">支付方式</span>
                <span class="sales-detail-value">${order.paymentMethod}</span>
            </div>
            ` : ''}
            ${order.paymentDate ? `
            <div class="sales-detail-row">
                <span class="sales-detail-label">支付时间</span>
                <span class="sales-detail-value">${order.paymentDate}</span>
            </div>
            ` : ''}
            <div class="sales-detail-row">
                <span class="sales-detail-label">下单时间</span>
                <span class="sales-detail-value">${order.createdAt}</span>
            </div>
        </div>
        ${order.status !== 'pending' ? `
        <div class="sales-detail-cards">
            <div class="sales-detail-section-title">电影卡信息</div>
            <div class="sales-card-list">
                ${order.cards.slice(0, 3).map(card => `
                <div class="sales-card-list-item">
                    <div class="sales-card-image">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                    </div>
                    <div class="sales-card-info">
                        <div class="sales-card-no">${card.number}</div>
                        <div class="sales-card-type">${typeMap[card.type]}</div>
                        <div class="sales-card-expiry">有效期至: ${card.expiry}</div>
                    </div>
                </div>
                `).join('')}
            </div>
            ${order.cards.length > 3 ? `
            <button class="view-all-sales-cards-btn" data-action="view-all-my-cards">查看全部 ${order.cards.length} 张</button>
            ` : ''}
        </div>
        ` : ''}
    `;
    
    // 查看全部按钮
    const viewAllBtn = container.querySelector('[data-action="view-all-my-cards"]');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            myCards = [...order.cards];
            closeSalesDetailModal();
            navigateTo('my-cards-page');
            renderMyCards();
        });
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭销售详情弹窗
function closeSalesDetailModal() {
    const modal = document.getElementById('sales-detail-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedSalesOrder = null;
}

// 渲染销售电影卡列表
function renderSalesCardList() {
    const container = document.getElementById('sales-card-list');
    if (!container) return;
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    
    container.innerHTML = salableCards.map(card => `
        <div class="sales-card-item" data-card-id="${card.id}">
            <div class="sales-card-header">
                <div class="sales-card-img">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%230f3460' width='100' height='100' rx='12'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='32' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
                </div>
                <div class="sales-card-main">
                    <div class="sales-card-title">${card.name}</div>
                    <span class="sales-card-type-badge ${card.type}">${typeMap[card.type]}</span>
                    <div class="sales-card-price">¥${card.price.toFixed(2)}</div>
                    <div class="sales-card-expiry">有效期至: ${card.expiry}</div>
                </div>
            </div>
            <div class="sales-card-footer">
                <div class="sales-quantity-selector">
                    <button class="sales-quantity-btn" data-action="sales-decrease">-</button>
                    <span class="sales-quantity-value">1</span>
                    <button class="sales-quantity-btn" data-action="sales-increase">+</button>
                </div>
                <button class="sales-select-btn" data-action="select-card">选择</button>
            </div>
        </div>
    `).join('');
    
    // 绑定数量调整事件
    container.querySelectorAll('.sales-card-item').forEach(item => {
        const cardId = item.dataset.cardId;
        const card = salableCards.find(c => c.id == cardId);
        
        const decreaseBtn = item.querySelector('[data-action="sales-decrease"]');
        const increaseBtn = item.querySelector('[data-action="sales-increase"]');
        const quantityValue = item.querySelector('.sales-quantity-value');
        const selectBtn = item.querySelector('[data-action="select-card"]');
        
        let quantity = 1;
        
        decreaseBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityValue.textContent = quantity;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            quantity++;
            quantityValue.textContent = quantity;
        });
        
        selectBtn.addEventListener('click', () => {
            openSalesConfirmModal(card, quantity);
        });
    });
}

// 打开销售确认弹窗
function openSalesConfirmModal(card, quantity) {
    selectedSalesCard = { ...card, quantity };
    selectedSalesQuantity = quantity;
    const modal = document.getElementById('sales-confirm-modal');
    const container = document.getElementById('sales-confirm-info');
    
    const typeMap = { year: '年卡', month: '月卡', times: '次卡' };
    const total = card.price * quantity;
    
    container.innerHTML = `
        <div class="sales-confirm-card">
            <div class="sales-confirm-img">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect fill='%230f3460' width='60' height='60' rx='8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23d4af37' font-size='20' font-weight='bold'%3E🎬%3C/text%3E%3C/svg%3E" alt="电影卡">
            </div>
            <div class="sales-confirm-details">
                <div class="sales-confirm-title">${card.name}</div>
                <div class="sales-confirm-quantity">数量: ${quantity}张</div>
                <div class="sales-confirm-price">¥${total.toFixed(2)}</div>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭销售确认弹窗
function closeSalesConfirmModal() {
    const modal = document.getElementById('sales-confirm-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // 不要在关闭时立即清空，在确认支付后再清空
}

// 提交销售订单
function submitSales() {
    if (!selectedSalesCard) {
        alert('请选择要销售的商品');
        return;
    }
    
    // 先保存要使用的金额信息
    const amount = selectedSalesCard.price * selectedSalesQuantity;
    
    // 先关闭确认弹窗，然后打开二维码弹窗
    closeSalesConfirmModal();
    
    // 稍微延迟一下，确保模态框正确关闭
    setTimeout(() => {
        openQrcodeModal(amount);
    }, 100);
}

// 打开二维码弹窗
function openQrcodeModal(amount) {
    console.log('Opening QR code modal, amount:', amount);
    const modal = document.getElementById('payment-qrcode-modal');
    console.log('QR code modal element:', modal);
    
    const amountEl = document.getElementById('qrcode-amount');
    if (amountEl) {
        amountEl.textContent = '¥' + amount.toFixed(2);
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        console.log('QR code modal should now be visible');
    } else {
        console.error('QR code modal not found!');
    }
}

// 关闭二维码弹窗
function closeQrcodeModal() {
    const modal = document.getElementById('payment-qrcode-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 确认支付
function confirmPayment() {
    if (!selectedSalesCard) {
        closeQrcodeModal();
        return;
    }
    
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    const paymentDate = `${date} ${time}`;
    
    // 生成新订单
    const newOrder = {
        id: salesOrders.length + 1,
        orderNo: `SAL${date.replace(/-/g, '')}${String(salesOrders.length + 1).padStart(3, '0')}`,
        status: 'completed',
        totalAmount: selectedSalesCard.price * selectedSalesQuantity,
        cardCount: selectedSalesQuantity,
        cards: [],
        paymentMethod: '微信支付',
        paymentDate: paymentDate,
        createdAt: paymentDate
    };
    
    // 生成电影卡
    for (let i = 0; i < selectedSalesQuantity; i++) {
        newOrder.cards.push({
            id: Date.now() + i,
            number: `999${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`,
            type: selectedSalesCard.type,
            expiry: selectedSalesCard.expiry
        });
    }
    
    salesOrders.unshift(newOrder);
    
    console.log('创建销售订单:', newOrder);
    alert('支付成功！订单已创建');
    closeQrcodeModal();
    
    // 清空变量
    selectedSalesCard = null;
    selectedSalesQuantity = 1;
    
    navigateTo('sales-management-page');
    renderSalesList();
    updateSalesStats();
}

// 结算管理数据
let settlements = [
    {
        id: 1,
        orderNo: 'ST20240520001',
        agentId: 1,
        agentName: '张明',
        agentPhone: '139****1234',
        settlementDate: '2024-05-20',
        settlementTime: '2024-05-20 14:30',
        amount: 1580,
        remark: '月度结算'
    },
    {
        id: 2,
        orderNo: 'ST20240518002',
        agentId: 2,
        agentName: '李华',
        agentPhone: '138****5678',
        settlementDate: '2024-05-18',
        settlementTime: '2024-05-18 10:15',
        amount: 2860,
        remark: '季度结算'
    },
    {
        id: 3,
        orderNo: 'ST20240515003',
        agentId: 3,
        agentName: '王芳',
        agentPhone: '137****9012',
        settlementDate: '2024-05-15',
        settlementTime: '2024-05-15 16:45',
        amount: 980,
        remark: '项目分成'
    }
];

let subAgents = [
    { id: 1, name: '张明', phone: '139****1234', commission: 1580 },
    { id: 2, name: '李华', phone: '138****5678', commission: 2860 },
    { id: 3, name: '王芳', phone: '137****9012', commission: 980 },
    { id: 4, name: '赵六', phone: '136****3456', commission: 4500 }
];

let selectedSettlementAgent = null;

// 余额和佣金数据
let accountBalance = 12580;
let balanceRecords = [
    { id: 1, title: '佣金收入', amount: 1580, type: 'plus', time: '2024-05-20 14:30', typeName: '佣金' },
    { id: 2, title: '购买电影卡', amount: -199, type: 'minus', time: '2024-05-19 10:20', typeName: '消费' },
    { id: 3, title: '充值', amount: 1000, type: 'plus', time: '2024-05-18 16:45', typeName: '充值' },
    { id: 4, title: '佣金收入', amount: 860, type: 'plus', time: '2024-05-15 09:30', typeName: '佣金' }
];

let commissionRecords = [
    { id: 1, title: '张明推广奖励', amount: 1580, type: 'plus', time: '2024-05-20 14:30', typeName: '推广奖' },
    { id: 2, title: '李华推广奖励', amount: 2860, type: 'plus', time: '2024-05-18 10:15', typeName: '推广奖' },
    { id: 3, title: '王芳推广奖励', amount: 980, type: 'plus', time: '2024-05-15 16:45', typeName: '推广奖' }
];

let rechargeRecords = [
    { id: 1, amount: 1000, time: '2024-05-18 16:45', status: 'success' },
    { id: 2, amount: 500, time: '2024-04-20 10:30', status: 'success' },
    { id: 3, amount: 2000, time: '2024-03-15 14:20', status: 'success' }
];

let selectedRechargeAmount = 100;

let totalCommission = 56800;
let balanceWithdrawRecords = [
    { id: 1, orderNo: 'TX20240510001', agentName: '王经理', agentPhone: '138****8888', amount: 2000, realAmount: 1988, method: '微信', time: '2024-05-10 14:30', status: 'success', remark: '日常提现' },
    { id: 2, orderNo: 'TX20240425002', agentName: '王经理', agentPhone: '138****8888', amount: 5000, realAmount: 4970, method: '银行卡', time: '2024-04-25 10:15', status: 'success', remark: '' },
    { id: 3, orderNo: 'TX20240415003', agentName: '王经理', agentPhone: '138****8888', amount: 1000, realAmount: 994, method: '支付宝', time: '2024-04-15 16:45', status: 'pending', remark: '紧急提现' }
];

let commissionWithdrawRecords = [
    { id: 1, orderNo: 'TX20240508001', agentName: '王经理', agentPhone: '138****8888', amount: 10000, realAmount: 9940, method: '银行卡', time: '2024-05-08 09:30', status: 'success', remark: '佣金结算' },
    { id: 2, orderNo: 'TX20240420002', agentName: '王经理', agentPhone: '138****8888', amount: 5000, realAmount: 4970, method: '微信', time: '2024-04-20 14:15', status: 'failed', remark: '信息有误' }
];

let selectedWithdrawMethod = 'wechat';

let subAgentWithdrawRecords = [
    { id: 1, orderNo: 'TX20240512001', agentName: '张代理', agentPhone: '139****6666', amount: 3000, realAmount: 2982, method: '微信', time: '2024-05-12 09:20', status: 'pending', remark: '' },
    { id: 2, orderNo: 'TX20240511002', agentName: '李代理', agentPhone: '137****5555', amount: 5000, realAmount: 4970, method: '银行卡', time: '2024-05-11 15:30', status: 'pending', remark: '' },
    { id: 3, orderNo: 'TX20240509003', agentName: '赵代理', agentPhone: '136****4444', amount: 1500, realAmount: 1491, method: '支付宝', time: '2024-05-09 11:45', status: 'success', remark: '审核通过' },
    { id: 4, orderNo: 'TX20240508004', agentName: '张代理', agentPhone: '139****6666', amount: 2000, realAmount: 1988, method: '微信', time: '2024-05-08 14:10', status: 'success', remark: '正常提现' },
    { id: 5, orderNo: 'TX20240507005', agentName: '刘代理', agentPhone: '135****3333', amount: 8000, realAmount: 7952, method: '银行卡', time: '2024-05-07 10:00', status: 'failed', remark: '银行卡信息有误' },
    { id: 6, orderNo: 'TX20240505006', agentName: '李代理', agentPhone: '137****5555', amount: 1000, realAmount: 994, method: '微信', time: '2024-05-05 16:25', status: 'success', remark: '审核通过' }
];

let currentProcessFilter = 'all';
let currentReviewRecord = null;
let currentReviewResult = 'success';

// 初始化结算管理
function initSettlementManagement() {
    renderSettlementList();
    
    // 结算按钮
    const settlementBtn = document.querySelector('[data-action="settlement-agent-list"]');
    if (settlementBtn) {
        settlementBtn.addEventListener('click', () => {
            navigateTo('settlement-agent-page');
            renderSettlementAgentList();
        });
    }
    
    // 结算列表点击事件
    const settlementListContainer = document.getElementById('settlement-list-container');
    if (settlementListContainer) {
        settlementListContainer.addEventListener('click', (e) => {
            const settlementItem = e.target.closest('.settlement-item');
            if (settlementItem) {
                const orderId = settlementItem.dataset.orderId;
                const settlement = settlements.find(s => s.id == orderId);
                if (settlement) {
                    openSettlementDetailModal(settlement);
                }
            }
        });
    }
    
    // 结算筛选标签
    const settlementListPage = document.getElementById('settlement-list-page');
    if (settlementListPage) {
        const filterTabs = settlementListPage.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderSettlementListFull();
            });
        });
    }
    
    // 关闭结算详情弹窗
    const closeSettlementDetailBtn = document.querySelector('[data-action="close-settlement-detail"]');
    if (closeSettlementDetailBtn) {
        closeSettlementDetailBtn.addEventListener('click', () => closeSettlementDetailModal());
    }
    
    const settlementDetailModal = document.getElementById('settlement-detail-modal');
    if (settlementDetailModal) {
        const overlay = settlementDetailModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeSettlementDetailModal());
        }
    }
    
    // 关闭结算确认弹窗
    const closeSettlementConfirmBtn = document.querySelector('[data-action="close-settlement-confirm"]');
    if (closeSettlementConfirmBtn) {
        closeSettlementConfirmBtn.addEventListener('click', () => closeSettlementConfirmModal());
    }
    
    const settlementConfirmModal = document.getElementById('settlement-confirm-modal');
    if (settlementConfirmModal) {
        const overlay = settlementConfirmModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeSettlementConfirmModal());
        }
    }
    
    // 提交结算
    const submitSettlementBtn = document.querySelector('[data-action="submit-settlement"]');
    if (submitSettlementBtn) {
        submitSettlementBtn.addEventListener('click', () => submitSettlement());
    }
}

// 渲染结算列表
function renderSettlementList() {
    const container = document.getElementById('settlement-list-container');
    if (!container) return;
    
    const displaySettlements = settlements.slice(0, 3);
    
    container.innerHTML = displaySettlements.map(settlement => `
        <div class="settlement-item" data-order-id="${settlement.id}">
            <div class="settlement-header">
                <span class="settlement-order-no">${settlement.orderNo}</span>
                <span class="settlement-date">${settlement.settlementDate}</span>
            </div>
            <div class="settlement-content">
                <div class="settlement-avatar">${settlement.agentName.charAt(0)}</div>
                <div class="settlement-info">
                    <div class="settlement-agent-name">${settlement.agentName}</div>
                    <div class="settlement-agent-phone">${settlement.agentPhone}</div>
                </div>
                <div class="settlement-amount">¥${settlement.amount.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

// 渲染完整结算列表
function renderSettlementListFull() {
    const container = document.getElementById('settlement-list-full');
    if (!container) return;
    
    const settlementListPage = document.getElementById('settlement-list-page');
    const activeFilter = settlementListPage.querySelector('.filter-tab.active')?.dataset.filter || 'all';
    
    let filteredSettlements = settlements;
    if (activeFilter !== 'all') {
        filteredSettlements = settlements.filter(s => s.settlementDate.startsWith(activeFilter));
    }
    
    container.innerHTML = filteredSettlements.map(settlement => `
        <div class="settlement-item" data-order-id="${settlement.id}">
            <div class="settlement-header">
                <span class="settlement-order-no">${settlement.orderNo}</span>
                <span class="settlement-date">${settlement.settlementDate}</span>
            </div>
            <div class="settlement-content">
                <div class="settlement-avatar">${settlement.agentName.charAt(0)}</div>
                <div class="settlement-info">
                    <div class="settlement-agent-name">${settlement.agentName}</div>
                    <div class="settlement-agent-phone">${settlement.agentPhone}</div>
                </div>
                <div class="settlement-amount">¥${settlement.amount.toFixed(2)}</div>
            </div>
        </div>
    `).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.settlement-item').forEach(item => {
        item.addEventListener('click', () => {
            const orderId = item.dataset.orderId;
            const settlement = settlements.find(s => s.id == orderId);
            if (settlement) {
                openSettlementDetailModal(settlement);
            }
        });
    });
}

// 打开结算详情弹窗
function openSettlementDetailModal(settlement) {
    const modal = document.getElementById('settlement-detail-modal');
    const container = document.getElementById('settlement-detail-info');
    
    container.innerHTML = `
        <div class="settlement-detail-header">
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">结算单号</span>
                <span class="settlement-detail-value">${settlement.orderNo}</span>
            </div>
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">代理人</span>
                <span class="settlement-detail-value">${settlement.agentName}</span>
            </div>
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">联系电话</span>
                <span class="settlement-detail-value">${settlement.agentPhone}</span>
            </div>
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">结算金额</span>
                <span class="settlement-detail-value">¥${settlement.amount.toFixed(2)}</span>
            </div>
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">结算日期</span>
                <span class="settlement-detail-value">${settlement.settlementDate}</span>
            </div>
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">结算时间</span>
                <span class="settlement-detail-value">${settlement.settlementTime}</span>
            </div>
            <div class="settlement-detail-row">
                <span class="settlement-detail-label">备注</span>
                <span class="settlement-detail-value">${settlement.remark}</span>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭结算详情弹窗
function closeSettlementDetailModal() {
    const modal = document.getElementById('settlement-detail-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 渲染结算代理人列表
function renderSettlementAgentList() {
    const container = document.getElementById('settlement-agent-list');
    if (!container) return;
    
    container.innerHTML = subAgents.map(agent => `
        <div class="settlement-agent-item">
            <div class="settlement-agent-avatar">${agent.name.charAt(0)}</div>
            <div class="settlement-agent-info">
                <div class="settlement-agent-name">${agent.name}</div>
                <div class="settlement-agent-phone">${agent.phone}</div>
                <div class="settlement-agent-commission">待结算: ¥${agent.commission.toFixed(2)}</div>
            </div>
            <button class="settlement-agent-btn" data-agent-id="${agent.id}">结算</button>
        </div>
    `).join('');
    
    // 绑定结算按钮事件
    container.querySelectorAll('.settlement-agent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const agentId = btn.dataset.agentId;
            const agent = subAgents.find(a => a.id == agentId);
            if (agent) {
                openSettlementConfirmModal(agent);
            }
        });
    });
}

// 打开结算确认弹窗
function openSettlementConfirmModal(agent) {
    selectedSettlementAgent = agent;
    const modal = document.getElementById('settlement-confirm-modal');
    
    // 设置默认值
    const dateInput = document.getElementById('settlement-date');
    const amountInput = document.getElementById('settlement-amount');
    const remarkInput = document.getElementById('settlement-remark');
    
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    if (amountInput) {
        amountInput.value = agent.commission;
    }
    if (remarkInput) {
        remarkInput.value = '';
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭结算确认弹窗
function closeSettlementConfirmModal() {
    const modal = document.getElementById('settlement-confirm-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedSettlementAgent = null;
}

// 提交结算
function submitSettlement() {
    if (!selectedSettlementAgent) {
        alert('请选择结算对象');
        return;
    }
    
    const dateInput = document.getElementById('settlement-date');
    const amountInput = document.getElementById('settlement-amount');
    const remarkInput = document.getElementById('settlement-remark');
    
    const settlementDate = dateInput?.value || new Date().toISOString().split('T')[0];
    const amount = parseFloat(amountInput?.value) || 0;
    const remark = remarkInput?.value || '';
    
    if (amount <= 0) {
        alert('请输入有效的结算金额');
        return;
    }
    
    // 生成新结算记录
    const now = new Date();
    const settlementTime = `${settlementDate} ${now.toTimeString().slice(0, 5)}`;
    const newSettlement = {
        id: settlements.length + 1,
        orderNo: `ST${settlementDate.replace(/-/g, '')}${String(settlements.length + 1).padStart(3, '0')}`,
        agentId: selectedSettlementAgent.id,
        agentName: selectedSettlementAgent.name,
        agentPhone: selectedSettlementAgent.phone,
        settlementDate: settlementDate,
        settlementTime: settlementTime,
        amount: amount,
        remark: remark
    };
    
    settlements.unshift(newSettlement);
    
    // 更新余额和佣金记录
    accountBalance += amount;
    balanceRecords.unshift({
        id: balanceRecords.length + 1,
        title: '佣金收入',
        amount: amount,
        type: 'plus',
        time: settlementTime,
        typeName: '佣金'
    });
    
    commissionRecords.unshift({
        id: commissionRecords.length + 1,
        title: `${selectedSettlementAgent.name}推广奖励`,
        amount: amount,
        type: 'plus',
        time: settlementTime,
        typeName: '推广奖'
    });
    
    console.log('创建结算记录:', newSettlement);
    alert('结算成功');
    closeSettlementConfirmModal();
    navigateTo('settlement-management-page');
    renderSettlementList();
}

// 初始化个人中心
function initProfile() {
    // 个人中心菜单点击
    const balanceDetailBtn = document.querySelector('[data-action="balance-detail"]');
    if (balanceDetailBtn) {
        balanceDetailBtn.addEventListener('click', () => navigateTo('balance-detail-page'));
    }
    
    const commissionDetailBtn = document.querySelector('[data-action="commission-detail"]');
    if (commissionDetailBtn) {
        commissionDetailBtn.addEventListener('click', () => navigateTo('commission-detail-page'));
    }
    
    const rechargeBtn = document.querySelector('[data-action="recharge"]');
    if (rechargeBtn) {
        rechargeBtn.addEventListener('click', () => navigateTo('recharge-page'));
    }
    
    // 余额详情页面的充值按钮
    const balanceRechargeBtn = document.querySelector('#balance-detail-page [data-action="recharge"]');
    if (balanceRechargeBtn) {
        balanceRechargeBtn.addEventListener('click', () => navigateTo('recharge-page'));
    }
    
    // 余额提现按钮
    const balanceWithdrawBtn = document.querySelector('[data-action="balance-withdraw"]');
    if (balanceWithdrawBtn) {
        balanceWithdrawBtn.addEventListener('click', () => {
            navigateTo('balance-withdraw-page');
            initWithdrawPage('balance');
        });
    }
    
    // 佣金提现按钮
    const commissionWithdrawBtn = document.querySelector('[data-action="commission-withdraw"]');
    if (commissionWithdrawBtn) {
        commissionWithdrawBtn.addEventListener('click', () => {
            navigateTo('commission-withdraw-page');
            initWithdrawPage('commission');
        });
    }
    
    // 余额提现确认
    const confirmBalanceWithdrawBtn = document.querySelector('[data-action="confirm-balance-withdraw"]');
    if (confirmBalanceWithdrawBtn) {
        confirmBalanceWithdrawBtn.addEventListener('click', () => confirmWithdraw('balance'));
    }
    
    // 佣金提现确认
    const confirmCommissionWithdrawBtn = document.querySelector('[data-action="confirm-commission-withdraw"]');
    if (confirmCommissionWithdrawBtn) {
        confirmCommissionWithdrawBtn.addEventListener('click', () => confirmWithdraw('commission'));
    }
    
    // 余额提现记录链接
    const balanceWithdrawRecordLink = document.querySelector('#balance-detail-page [data-page="balance-withdraw-record-page"]');
    if (balanceWithdrawRecordLink) {
        balanceWithdrawRecordLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('balance-withdraw-record-page');
            renderWithdrawRecordList('balance');
        });
    }
    
    // 佣金提现记录链接
    const commissionWithdrawRecordLink = document.querySelector('#commission-detail-page [data-page="commission-withdraw-record-page"]');
    if (commissionWithdrawRecordLink) {
        commissionWithdrawRecordLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('commission-withdraw-record-page');
            renderWithdrawRecordList('commission');
        });
    }
    
    // 提现处理入口
    const withdrawProcessBtn = document.querySelector('[data-action="withdraw-process"]');
    if (withdrawProcessBtn) {
        withdrawProcessBtn.addEventListener('click', () => {
            navigateTo('withdraw-process-page');
            initWithdrawProcessPage();
        });
    }
    
    // 提现处理筛选标签
    const filterTabs = document.querySelectorAll('.withdraw-process-filter .filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentProcessFilter = tab.dataset.filter;
            renderWithdrawProcessList();
        });
    });
    
    // 审核弹窗关闭
    const closeReviewBtns = document.querySelectorAll('[data-action="close-withdraw-review"]');
    closeReviewBtns.forEach(btn => {
        btn.addEventListener('click', () => closeWithdrawReviewModal());
    });
    
    // 审核弹窗提交
    const submitReviewBtn = document.querySelector('[data-action="submit-withdraw-review"]');
    if (submitReviewBtn) {
        submitReviewBtn.addEventListener('click', () => submitWithdrawReview());
    }
    
    // 审核结果选择
    const reviewResultItems = document.querySelectorAll('.review-result-item');
    reviewResultItems.forEach(item => {
        item.addEventListener('click', () => {
            reviewResultItems.forEach(i => {
                i.classList.remove('selected');
                i.querySelector('.result-radio').classList.remove('checked');
            });
            item.classList.add('selected');
            item.querySelector('.result-radio').classList.add('checked');
            currentReviewResult = item.dataset.result;
        });
    });
    
    // 弹窗遮罩关闭
    const reviewOverlay = document.querySelector('#withdraw-review-modal .modal-overlay');
    if (reviewOverlay) {
        reviewOverlay.addEventListener('click', () => closeWithdrawReviewModal());
    }
}

// 初始化充值页面
function initRechargePage() {
    // 充值选项点击
    const rechargeOptions = document.querySelectorAll('#recharge-page .recharge-option');
    rechargeOptions.forEach(option => {
        option.addEventListener('click', () => {
            rechargeOptions.forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedRechargeAmount = parseInt(option.dataset.amount);
            const customInput = document.getElementById('custom-recharge-input');
            if (customInput) customInput.value = '';
        });
    });
    
    // 自定义充值金额
    const customRechargeInput = document.getElementById('custom-recharge-input');
    if (customRechargeInput) {
        customRechargeInput.addEventListener('input', (e) => {
            if (e.target.value) {
                rechargeOptions.forEach(o => o.classList.remove('selected'));
                selectedRechargeAmount = parseInt(e.target.value) || 0;
            }
        });
    }
    
    // 确认充值
    const confirmRechargeBtn = document.getElementById('confirm-recharge-btn');
    if (confirmRechargeBtn) {
        confirmRechargeBtn.addEventListener('click', () => confirmRecharge());
    }
}

// 打开充值弹窗
function openRechargeModal() {
    const modal = document.getElementById('recharge-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭充值弹窗
function closeRechargeModal() {
    const modal = document.getElementById('recharge-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 确认充值
function confirmRecharge() {
    const customInput = document.getElementById('custom-recharge-amount');
    let amount = selectedRechargeAmount;
    
    if (customInput?.value) {
        amount = parseInt(customInput.value) || 0;
    }
    
    if (amount <= 0) {
        alert('请输入有效的充值金额');
        return;
    }
    
    // 更新余额
    accountBalance += amount;
    
    // 添加余额记录
    const now = new Date();
    const time = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    balanceRecords.unshift({
        id: balanceRecords.length + 1,
        title: '充值',
        amount: amount,
        type: 'plus',
        time: time,
        typeName: '充值'
    });
    
    // 添加充值记录
    rechargeRecords.unshift({
        id: rechargeRecords.length + 1,
        amount: amount,
        time: time,
        status: 'success'
    });
    
    console.log('充值成功:', amount);
    alert('充值成功');
    updateProfileBalance();
    renderRechargeRecordList();
}

// 更新个人中心余额显示
function updateProfileBalance() {
    const balanceCard = document.querySelector('.balance-amount');
    if (balanceCard) {
        balanceCard.textContent = `¥${accountBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
    }
}

// 渲染余额明细
function renderBalanceDetailList() {
    const container = document.getElementById('balance-detail-list');
    if (!container) return;
    
    container.innerHTML = balanceRecords.map(record => `
        <div class="detail-item">
            <div class="detail-row">
                <div class="detail-title">${record.title}</div>
                <div class="detail-amount ${record.type}">
                    ${record.type === 'plus' ? '+' : ''}¥${Math.abs(record.amount).toFixed(2)}
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-time">${record.time}</div>
                <div class="detail-type">${record.typeName}</div>
            </div>
        </div>
    `).join('');
}

// 渲染佣金明细
function renderCommissionDetailList() {
    const container = document.getElementById('commission-detail-list');
    if (!container) return;
    
    container.innerHTML = commissionRecords.map(record => `
        <div class="detail-item">
            <div class="detail-row">
                <div class="detail-title">${record.title}</div>
                <div class="detail-amount ${record.type}">
                    ${record.type === 'plus' ? '+' : ''}¥${Math.abs(record.amount).toFixed(2)}
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-time">${record.time}</div>
                <div class="detail-type">${record.typeName}</div>
            </div>
        </div>
    `).join('');
}

function initWithdrawPage(type) {
    selectedWithdrawMethod = 'wechat';
    
    const pageId = type === 'balance' ? 'balance-withdraw-page' : 'commission-withdraw-page';
    const page = document.getElementById(pageId);
    if (!page) return;
    
    const amountInput = page.querySelector('input[type="number"]');
    if (amountInput) {
        amountInput.value = '';
        amountInput.addEventListener('input', () => updateWithdrawSummary(type));
    }
    
    const methodItems = page.querySelectorAll('.withdraw-method-item');
    methodItems.forEach(item => {
        item.addEventListener('click', () => {
            methodItems.forEach(m => m.classList.remove('selected'));
            item.classList.add('selected');
            selectedWithdrawMethod = item.dataset.method;
        });
    });
    
    updateWithdrawAvailable(type);
    updateWithdrawSummary(type);
    
    if (type === 'balance') {
        renderWithdrawRecordList('balance');
    } else {
        renderWithdrawRecordList('commission');
    }
}

function updateWithdrawAvailable(type) {
    if (type === 'balance') {
        const el = document.getElementById('withdraw-balance-available');
        if (el) el.textContent = `¥${accountBalance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
    } else {
        const el = document.getElementById('withdraw-commission-available');
        if (el) el.textContent = `¥${totalCommission.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;
    }
}

function updateWithdrawSummary(type) {
    const pageId = type === 'balance' ? 'balance-withdraw-page' : 'commission-withdraw-page';
    const page = document.getElementById(pageId);
    if (!page) return;
    
    const amountInput = page.querySelector('input[type="number"]');
    const amount = parseFloat(amountInput?.value) || 0;
    const fee = Math.round(amount * 0.006 * 100) / 100;
    const realAmount = Math.max(0, amount - fee);
    
    const prefix = type === 'balance' ? 'balance' : 'commission';
    const amountEl = document.getElementById(`${prefix}-withdraw-summary-amount`);
    const feeEl = document.getElementById(`${prefix}-withdraw-summary-fee`);
    const realEl = document.getElementById(`${prefix}-withdraw-summary-real`);
    
    if (amountEl) amountEl.textContent = `¥${amount.toFixed(2)}`;
    if (feeEl) feeEl.textContent = `¥${fee.toFixed(2)}`;
    if (realEl) realEl.textContent = `¥${realAmount.toFixed(2)}`;
}

function confirmWithdraw(type) {
    const pageId = type === 'balance' ? 'balance-withdraw-page' : 'commission-withdraw-page';
    const page = document.getElementById(pageId);
    if (!page) return;
    
    const amountInput = page.querySelector('input[type="number"]');
    const amount = parseFloat(amountInput?.value) || 0;
    
    if (amount < 1) {
        alert('提现金额不能低于1元');
        return;
    }
    
    const maxAmount = type === 'balance' ? accountBalance : totalCommission;
    if (amount > maxAmount) {
        alert(`提现金额不能超过可提现金额 ¥${maxAmount.toFixed(2)}`);
        return;
    }
    
    const fee = Math.round(amount * 0.006 * 100) / 100;
    const realAmount = amount - fee;
    const methodNames = { wechat: '微信', alipay: '支付宝', bank: '银行卡' };
    const methodName = methodNames[selectedWithdrawMethod] || '微信';
    
    const now = new Date();
    const time = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    const orderNo = `TX${dateStr}${String((type === 'balance' ? balanceWithdrawRecords : commissionWithdrawRecords).length + 1).padStart(3, '0')}`;
    
    const record = {
        id: (type === 'balance' ? balanceWithdrawRecords : commissionWithdrawRecords).length + 1,
        orderNo: orderNo,
        agentName: currentAgent.name,
        agentPhone: currentAgent.phone.slice(0, 3) + '****' + currentAgent.phone.slice(7),
        amount: amount,
        realAmount: realAmount,
        method: methodName,
        time: time,
        status: 'pending',
        remark: ''
    };
    
    if (type === 'balance') {
        accountBalance -= amount;
        balanceWithdrawRecords.unshift(record);
        balanceRecords.unshift({
            id: balanceRecords.length + 1,
            title: '余额提现',
            amount: -amount,
            type: 'minus',
            time: time,
            typeName: '提现'
        });
    } else {
        totalCommission -= amount;
        commissionWithdrawRecords.unshift(record);
        balanceRecords.unshift({
            id: balanceRecords.length + 1,
            title: '佣金提现',
            amount: -amount,
            type: 'minus',
            time: time,
            typeName: '提现'
        });
    }
    
    console.log(`${type === 'balance' ? '余额' : '佣金'}提现成功:`, record);
    alert('提现申请已提交，预计1-3个工作日到账');
    
    updateProfileBalance();
    updateWithdrawAvailable(type);
    renderBalanceDetailList();
    renderWithdrawRecordList(type);
    
    amountInput.value = '';
    updateWithdrawSummary(type);
}

function renderWithdrawRecordList(type) {
    const containerId = type === 'balance' ? 'balance-withdraw-record-list' : 'commission-withdraw-record-list';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const records = type === 'balance' ? balanceWithdrawRecords : commissionWithdrawRecords;
    const statusMap = { success: '提现成功', pending: '待审核', failed: '提现失败' };
    
    container.innerHTML = records.length === 0 ? '<div class="empty-tip">暂无提现记录</div>' : records.map(record => `
        <div class="withdraw-record-item">
            <div class="withdraw-record-header">
                <div class="withdraw-record-order">单号：${record.orderNo}</div>
                <span class="withdraw-status ${record.status}">${statusMap[record.status] || record.status}</span>
            </div>
            <div class="withdraw-record-body">
                <div class="withdraw-record-agent">
                    <div class="withdraw-agent-avatar">${record.agentName[0]}</div>
                    <div class="withdraw-agent-info">
                        <div class="withdraw-agent-name">${record.agentName}</div>
                        <div class="withdraw-agent-phone">${record.agentPhone}</div>
                    </div>
                </div>
                <div class="withdraw-record-amounts">
                    <div class="withdraw-amount-row">
                        <span class="withdraw-amount-label">提现金额</span>
                        <span class="withdraw-amount-value">¥${record.amount.toFixed(2)}</span>
                    </div>
                    <div class="withdraw-amount-row">
                        <span class="withdraw-amount-label">实转金额</span>
                        <span class="withdraw-amount-value real">¥${record.realAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <div class="withdraw-record-footer">
                <div class="withdraw-record-meta">
                    <span>${record.method}</span>
                    <span>${record.time}</span>
                </div>
                ${record.remark ? `<div class="withdraw-record-remark">备注：${record.remark}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// 渲染充值记录
function renderRechargeRecordList() {
    const container = document.getElementById('recharge-record-list');
    if (!container) return;
    
    container.innerHTML = rechargeRecords.map(record => `
        <div class="detail-item">
            <div class="detail-row">
                <div class="detail-title">账户充值</div>
                <div class="detail-amount plus">+¥${record.amount.toFixed(2)}</div>
            </div>
            <div class="detail-row">
                <div class="detail-time">${record.time}</div>
                <div class="detail-type">充值成功</div>
            </div>
        </div>
    `).join('');
}

// 消息数据
let messages = [
    {
        id: 1,
        title: '新代理注册通知',
        preview: '您的下级代理李明已成功注册，快去看看吧！',
        content: '您好！\n\n您的下级代理李明（手机号：139****1234）已成功注册成为代理。\n\n请尽快与该代理取得联系，帮助他们熟悉系统和业务。\n\n如有任何问题，请联系客服。\n\n祝您工作顺利！',
        date: '2024-05-23',
        time: '2024-05-23 10:30:00',
        read: false
    },
    {
        id: 2,
        title: '佣金发放通知',
        preview: '您的本月佣金已发放，共计12,580元，请注意查收！',
        content: '尊敬的王经理：\n\n您好！\n\n您的本月佣金已成功发放，金额为人民币12,580.00元。\n\n佣金详情：\n- 推广奖励：8,580.00元\n- 销售提成：4,000.00元\n\n佣金已直接转入您的账户余额，您可以随时查看或使用。\n\n如有任何疑问，请联系客服。\n\n感谢您的辛勤付出！',
        date: '2024-05-22',
        time: '2024-05-22 14:15:00',
        read: false
    },
    {
        id: 3,
        title: '系统升级通知',
        preview: '系统将于今晚22:00-次日02:00进行升级维护，请注意安排工作时间。',
        content: '尊敬的用户：\n\n您好！\n\n为了提供更好的服务体验，系统将于2024年5月23日22:00至次日02:00进行升级维护。\n\n升级期间，系统将暂停服务，请您提前安排好工作时间，给您带来不便，敬请谅解！\n\n升级内容：\n1. 优化代理管理功能\n2. 增加数据报表功能\n3. 修复已知bug\n\n升级完成后，系统功能将更加强大！\n\n如有紧急问题，请联系客服热线。\n\n感谢您的理解与支持！',
        date: '2024-05-21',
        time: '2024-05-21 09:00:00',
        read: false
    },
    {
        id: 4,
        title: '电影卡库存提醒',
        preview: '您的电影卡库存不足，请及时采购补充！',
        content: '尊敬的王经理：\n\n您好！\n\n您的电影卡库存已低于安全库存，请及时采购补充。\n\n库存详情：\n- VIP年卡：剩余5张\n- VIP月卡：剩余12张\n- VIP次卡：剩余20张\n\n建议立即登录系统进行采购，以免影响您的业务开展。\n\n如有采购相关问题，请联系采购专员。\n\n谢谢！',
        date: '2024-05-20',
        time: '2024-05-20 16:45:00',
        read: true
    },
    {
        id: 5,
        title: '结算完成通知',
        preview: '您的上月结算已完成，结算金额8,580元。',
        content: '尊敬的王经理：\n\n您好！\n\n您的2024年4月结算已完成，结算金额为8,580.00元。\n\n结算详情：\n- 应付佣金：10,000.00元\n- 已扣税费：1,420.00元\n- 实付金额：8,580.00元\n\n结算金额已转入您的账户余额，请注意查收。\n\n感谢您的支持！',
        date: '2024-05-18',
        time: '2024-05-18 11:20:00',
        read: true
    }
];

// 初始化消息模块
function initMessageModule() {
    // 更新未读消息数
    updateMessageBadge();
    
    // 消息图标点击事件
    const messageBtn = document.querySelector('[data-action="message-list"]');
    if (messageBtn) {
        messageBtn.addEventListener('click', () => {
            navigateTo('message-list-page');
            renderMessageList();
        });
    }
    
    // 关闭消息详情弹窗
    const closeDetailBtn = document.querySelector('[data-action="close-message-detail"]');
    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => closeMessageDetailModal());
    }
    
    const detailModal = document.getElementById('message-detail-modal');
    if (detailModal) {
        const overlay = detailModal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => closeMessageDetailModal());
        }
    }
}

// 更新未读消息数
function updateMessageBadge() {
    const badge = document.getElementById('message-badge');
    if (badge) {
        const unreadCount = messages.filter(m => !m.read).length;
        badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
}

// 渲染消息列表
function renderMessageList() {
    const container = document.getElementById('message-list');
    if (!container) return;
    
    container.innerHTML = messages.map(msg => `
        <div class="message-item ${!msg.read ? 'unread' : ''}" data-message-id="${msg.id}">
            <div class="message-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            </div>
            <div class="message-content">
                <div class="message-title">${msg.title}</div>
                <div class="message-preview">${msg.preview}</div>
                <div class="message-date">${msg.time}</div>
            </div>
        </div>
    `).join('');
    
    // 绑定点击事件
    container.querySelectorAll('.message-item').forEach(item => {
        item.addEventListener('click', () => {
            const msgId = parseInt(item.dataset.messageId);
            openMessageDetail(msgId);
        });
    });
}

// 打开消息详情
function openMessageDetail(msgId) {
    const msg = messages.find(m => m.id === msgId);
    if (!msg) return;
    
    // 标记为已读
    if (!msg.read) {
        msg.read = true;
        updateMessageBadge();
        // 更新列表中的显示
        const item = document.querySelector(`.message-item[data-message-id="${msgId}"]`);
        if (item) {
            item.classList.remove('unread');
        }
    }
    
    const modal = document.getElementById('message-detail-modal');
    const container = document.getElementById('message-detail-info');
    const title = document.getElementById('message-detail-title');
    
    title.textContent = '消息详情';
    
    container.innerHTML = `
        <div class="message-detail-header">
            <div class="message-detail-title">${msg.title}</div>
            <div class="message-detail-date">${msg.time}</div>
        </div>
        <div class="message-detail-body">
            <div class="message-detail-content">${msg.content.replace(/\n/g, '<br>')}</div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭消息详情弹窗
function closeMessageDetailModal() {
    const modal = document.getElementById('message-detail-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// 在 DOMContentLoaded 中调用新功能
document.addEventListener('DOMContentLoaded', () => {
    initPageNavigation();
    initAgentTabs();
    initModal();
    initRewardModal();
    initAgentActions();
    initRewardActions();
    initCardManagement();
    initPromotionRecords();
    initAgentManagement();
    initPurchaseManagement();
    initSalesManagement();
    initSettlementManagement();
    initProfile();
    initMessageModule();
});
