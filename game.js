// Game state
let gameState = {
    score: 0,
    money: 50,
    level: 1,
    currentQuest: 0,
    questProgress: 0,
    totalCorrectAnswers: 0,
    purchasedItems: [],
    currentNumber: 0,
    correctAnswer: 0,
    isAnswered: false
};

// Game configuration
const config = {
    questionsPerQuest: 3,
    baseMoneyPerCorrect: 10,
    scoreMultiplier: 1,
    shopItems: [
        { id: 1, name: "🍎 Apple", price: 5, effect: "bonus:5", description: "+5 очков" },
        { id: 2, name: "📚 Textbook", price: 15, effect: "multiplier:1.5", description: "x1.5 множитель очков" },
        { id: 3, name: "💎 Gem", price: 25, effect: "bonus:10", description: "+10 очков" },
        { id: 4, name: "🎯 Target Practice", price: 20, effect: "bonus:money:20", description: "+$20" },
        { id: 5, name: "🧮 Calculator", price: 30, effect: "skip:1", description: "Пропустить 1 вопрос" },
        { id: 6, name: "🏆 Trophy", price: 50, effect: "achievement:money_master", description: "Достигните $100" },
        { id: 7, name: "📈 Progress Chart", price: 40, effect: "bonus:level:1", description: "Уровень +1" },
        { id: 8, name: "⭐ Star Power", price: 35, effect: "bonus:correct:5", description: "+5 к правильным ответам" }
    ],
    quests: [
        {
            title: "Начинающий округлятель",
            description: "Round the prices correctly to buy items.",
            difficulty: "easy",
            targetRounding: "tens"
        },
        {
            title: "Продвинутый математик",
            description: "Master rounding to the nearest hundred.",
            difficulty: "medium",
            targetRounding: "hundreds"
        },
        {
            title: "Эксперт округления",
            description: "Handle decimal numbers with precision.",
            difficulty: "hard",
            targetRounding: "decimals"
        }
    ],
    achievements: [
        {
            id: "first_purchase",
            name: "🎯 First Purchase",
            description: "Buy your first item",
            unlocked: false
        },
        {
            id: "money_master",
            name: "💰 Money Master",
            description: "Reach $100",
            unlocked: false
        },
        {
            id: "rounding_expert",
            name: "🧮 Rounding Expert",
            description: "Complete 10 rounds correctly",
            unlocked: false
        },
        {
            id: "level_champion",
            name: "🏆 Level Champion",
            description: "Reach level 5",
            unlocked: false
        },
        {
            id: "perfect_quest",
            name: "⭐ Perfect Quest",
            description: "Complete a quest without mistakes",
            unlocked: false
        }
    ]
};

// Initialize game
function initGame() {
    loadGameState();
    updateDisplay();
    generateNewQuestion();
    renderShopItems();
    renderAchievements();
}

// Generate new question based on current level
function generateNewQuestion() {
    const currentQuest = config.quests[gameState.level - 1];
    let number, correctAnswer;
    
    gameState.isAnswered = false;
    
    switch (currentQuest.targetRounding) {
        case "tens":
            number = Math.floor(Math.random() * 90) + 10;
            correctAnswer = Math.round(number / 10) * 10;
            break;
        case "hundreds":
            number = Math.floor(Math.random() * 900) + 100;
            correctAnswer = Math.round(number / 100) * 100;
            break;
        case "decimals":
            number = Math.round((Math.random() * 90 + 10) * 10) / 10;
            correctAnswer = Math.round(number);
            break;
        default:
            number = Math.floor(Math.random() * 90) + 10;
            correctAnswer = Math.round(number / 10) * 10;
    }
    
    gameState.currentNumber = number;
    gameState.correctAnswer = correctAnswer;
    
    document.getElementById('target-number').textContent = number;
    generateOptions(number, correctAnswer);
    clearFeedback();
}

// Generate answer options
function generateOptions(number, correctAnswer) {
    const options = [correctAnswer];
    const range = gameState.level === 1 ? 20 : gameState.level === 2 ? 50 : 100;
    
    while (options.length < 4) {
        const option = correctAnswer + Math.floor(Math.random() * range) - Math.floor(range / 2);
        if (option !== correctAnswer && !options.includes(option)) {
            options.push(option);
        }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
    }
    
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        btn.textContent = options[index];
        btn.disabled = false;
        btn.className = 'option-btn';
        btn.onclick = () => checkAnswer(btn);
    });
}

// Check answer
function checkAnswer(button) {
    if (gameState.isAnswered) return;
    
    gameState.isAnswered = true;
    const selectedAnswer = parseInt(button.textContent);
    const isCorrect = selectedAnswer === gameState.correctAnswer;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    if (isCorrect) {
        button.classList.add('correct');
        handleCorrectAnswer();
    } else {
        button.classList.add('incorrect');
        showIncorrectAnswer(button);
    }
    
    // Check quest completion
    setTimeout(() => {
        gameState.questProgress++;
        updateDisplay();
        checkQuestCompletion();
    }, 1500);
}

// Handle correct answer
function handleCorrectAnswer() {
    const currentQuest = config.quests[gameState.level - 1];
    let earnedMoney = config.baseMoneyPerCorrect * config.scoreMultiplier;
    let earnedScore = 10 * config.scoreMultiplier;
    
    if (currentQuest.difficulty === "medium") {
        earnedMoney *= 1.5;
        earnedScore *= 1.5;
    } else if (currentQuest.difficulty === "hard") {
        earnedMoney *= 2;
        earnedScore *= 2;
    }
    
    gameState.money += Math.floor(earnedMoney);
    gameState.score += Math.floor(earnedScore);
    gameState.totalCorrectAnswers++;
    
    showFeedback(`Правильно! Вы заработали $${earnedMoney} и ${earnedScore} очков!`, 'correct');
    
    checkAchievements();
    updateDisplay();
}

// Show incorrect answer
function showIncorrectAnswer(button) {
    const correctButton = Array.from(document.querySelectorAll('.option-btn'))
        .find(btn => parseInt(btn.textContent) === gameState.correctAnswer);
    correctButton.classList.add('correct');
    
    showFeedback(`Неправильно! Правильный ответ: ${gameState.correctAnswer}`, 'incorrect');
}

// Show feedback
function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}

// Clear feedback
function clearFeedback() {
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';
}

// Check quest completion
function checkQuestCompletion() {
    if (gameState.questProgress >= config.questionsPerQuest) {
        completeQuest();
    } else {
        generateNewQuestion();
    }
}

// Complete current quest
function completeQuest() {
    const currentQuest = config.quests[gameState.level - 1];
    showFeedback(`Поздравляем! Вы завершили квест "${currentQuest.title}"!`, 'correct');
    
    setTimeout(() => {
        gameState.level++;
        gameState.questProgress = 0;
        
        if (gameState.level > config.quests.length) {
            // Game completed
            showGameComplete();
        } else {
            // Start next quest
            const nextQuest = config.quests[gameState.level - 1];
            document.getElementById('quest-text').textContent = 
                `${nextQuest.description} Round the prices correctly to buy items.`;
            updateDisplay();
            generateNewQuestion();
        }
    }, 2000);
}

// Show game complete
function showGameComplete() {
    document.getElementById('quest-text').textContent = 
        `Поздравляем! Вы завершили игру! Финальный счёт: ${gameState.score} очков и $${gameState.money}!`;
    generateNewQuestion();
}

// Shop functionality
function renderShopItems() {
    const shopContainer = document.getElementById('store-items');
    shopContainer.innerHTML = '';
    
    config.shopItems.forEach(item => {
        const isPurchased = gameState.purchasedItems.includes(item.id);
        const itemElement = document.createElement('div');
        itemElement.className = `store-item ${isPurchased ? 'purchased' : ''}`;
        
        if (!isPurchased) {
            itemElement.onclick = () => purchaseItem(item);
        }
        
        itemElement.innerHTML = `
            <div class="item-name">${item.name}</div>
            <div class="item-price">$${item.price}</div>
        `;
        
        shopContainer.appendChild(itemElement);
    });
}

// Purchase item
function purchaseItem(item) {
    if (gameState.money >= item.price && !gameState.purchasedItems.includes(item.id)) {
        gameState.money -= item.price;
        gameState.purchasedItems.push(item.id);
        
        // Apply item effect
        applyItemEffect(item);
        
        // Update display
        updateDisplay();
        renderShopItems();
        
        // Check achievements
        checkAchievements();
        
        showFeedback(`Вы купили ${item.name}! ${item.description}`, 'correct');
    } else if (gameState.purchasedItems.includes(item.id)) {
        showFeedback('Этот предмет уже куплен!', 'incorrect');
    } else {
        showFeedback('Недостаточно денег!', 'incorrect');
    }
}

// Apply item effect
function applyItemEffect(item) {
    switch (item.effect) {
        case 'bonus:5':
            gameState.score += 5;
            break;
        case 'multiplier:1.5':
            config.scoreMultiplier = 1.5;
            break;
        case 'bonus:10':
            gameState.score += 10;
            break;
        case 'bonus:money:20':
            gameState.money += 20;
            break;
        case 'skip:1':
            gameState.questProgress++;
            break;
        case 'bonus:level:1':
            gameState.level = Math.min(gameState.level + 1, config.quests.length);
            break;
        case 'bonus:correct:5':
            gameState.totalCorrectAnswers += 5;
            break;
    }
}

// Render achievements
function renderAchievements() {
    const achievementContainer = document.getElementById('achievements');
    achievementContainer.innerHTML = '';
    
    config.achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
        
        achievementElement.innerHTML = `
            <span>${achievement.name}</span>
            <small>${achievement.description}</small>
        `;
        
        achievementContainer.appendChild(achievementElement);
    });
}

// Check achievements
function checkAchievements() {
    let newAchievements = [];
    
    // First purchase
    if (gameState.purchasedItems.length > 0 && !config.achievements[0].unlocked) {
        config.achievements[0].unlocked = true;
        newAchievements.push(config.achievements[0]);
    }
    
    // Money master
    if (gameState.money >= 100 && !config.achievements[1].unlocked) {
        config.achievements[1].unlocked = true;
        newAchievements.push(config.achievements[1]);
    }
    
    // Rounding expert
    if (gameState.totalCorrectAnswers >= 10 && !config.achievements[2].unlocked) {
        config.achievements[2].unlocked = true;
        newAchievements.push(config.achievements[2]);
    }
    
    // Level champion
    if (gameState.level >= 5 && !config.achievements[3].unlocked) {
        config.achievements[3].unlocked = true;
        newAchievements.push(config.achievements[3]);
    }
    
    // Perfect quest
    if (gameState.questProgress >= config.questionsPerQuest && 
        gameState.questProgress === config.questionsPerQuest && !config.achievements[4].unlocked) {
        config.achievements[4].unlocked = true;
        newAchievements.push(config.achievements[4]);
    }
    
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            showFeedback(`Достижение разблокировано: ${achievement.name}!`, 'correct');
        });
        renderAchievements();
        saveGameState();
    }
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('money').textContent = gameState.money;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('progress').textContent = `${gameState.questProgress}/${config.questionsPerQuest}`;
    
    const progressPercent = (gameState.questProgress / config.questionsPerQuest) * 100;
    document.getElementById('progress-fill').style.width = `${progressPercent}%`;
}

// Reset game
function resetGame() {
    gameState = {
        score: 0,
        money: 50,
        level: 1,
        currentQuest: 0,
        questProgress: 0,
        totalCorrectAnswers: 0,
        purchasedItems: [],
        currentNumber: 0,
        correctAnswer: 0,
        isAnswered: false
    };
    
    config.scoreMultiplier = 1;
    config.achievements.forEach(achievement => {
        achievement.unlocked = false;
    });
    
    document.getElementById('quest-text').textContent = 
        "Welcome to the Neighborhood Store! Round the prices correctly to buy items.";
    
    saveGameState();
    updateDisplay();
    generateNewQuestion();
    renderShopItems();
    renderAchievements();
    
    showFeedback('Игра сброшена! Удачи!', 'correct');
}

// Show help
function showHelp() {
    document.getElementById('help-modal').style.display = 'block';
}

// Close help
function closeHelp() {
    document.getElementById('help-modal').style.display = 'none';
}

// Save game state
function saveGameState() {
    localStorage.setItem('roundingQuestGame', JSON.stringify(gameState));
    localStorage.setItem('roundingQuestAchievements', JSON.stringify(config.achievements));
}

// Load game state
function loadGameState() {
    const savedState = localStorage.getItem('roundingQuestGame');
    const savedAchievements = localStorage.getItem('roundingQuestAchievements');
    
    if (savedState) {
        gameState = JSON.parse(savedState);
    }
    
    if (savedAchievements) {
        const loadedAchievements = JSON.parse(savedAchievements);
        loadedAchievements.forEach((loaded, index) => {
            if (config.achievements[index]) {
                config.achievements[index].unlocked = loaded.unlocked;
            }
        });
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('help-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);