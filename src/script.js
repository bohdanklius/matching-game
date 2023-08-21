class MemoryGame {
    constructor(args) {
        this.width = args.width || '100px';
        this.height = args.height || '100px';
        this.columns = args.columns || 4;
        this.rows = args.rows || 4;
        this.timeLimit = args.timeLimit || 60;
        this.theme = args.theme;

        this.grid = [];
        this.selectedCards = [];
        this.lockBoard = false;
        this.isTimerStarted = false;
        this.timerInterval = null;

        this.timerElement = document.querySelector('.timer');
        this.timeLimitElement = document.querySelector('.time-limit');
        this.restartButton = document.querySelector('.restart-button');
        this.gameWrapper = document.querySelector('.game-wrapper');

        this.createGrid();
        this.shuffleGrid();
        this.updateTimer(this.timeLimit);
        this.updateGridDisplay();

        this.gameWrapper.addEventListener('mouseenter', () => {
            this.isMouseOverGame = true;
        });

        this.gameWrapper.addEventListener('mouseleave', () => {
            this.isMouseOverGame = false;
        });

        this.restartButton.addEventListener('click', () => this.restartGame());

        this.gameWrapper.addEventListener('mouseenter', () => {
            if (this.isTimerStarted) {
                this.isMouseOverGame = true;
                this.gameWrapper.classList.remove('paused');
            }
        });
        
        this.gameWrapper.addEventListener('mouseleave', () => {
            if (this.isTimerStarted) {
                this.isMouseOverGame = false;
                this.gameWrapper.classList.add('paused');
            }
        });
    }

    generateCardNumbers() {
        const totalCards = this.columns * this.rows;
        const cardNumbers = [];

        for (let i = 1; i <= totalCards / 2; i++) {
            cardNumbers.push(i, i);
        }

        return cardNumbers.sort(() => Math.random() - 0.5);
    }

    createGrid() {
        const gameContainer = document.querySelector('.game-container');
        
        const cardNumbers = this.generateCardNumbers();
    
        for (let i = 0; i < this.rows * this.columns; i++) {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.number = cardNumbers[i];
            card.style.width = this.width;
            card.style.height = this.height;
    
            const cardInner = document.createElement('div');
            cardInner.classList.add('card-inner');
    
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            cardFront.textContent = '?';
            cardInner.appendChild(cardFront);
    
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            cardBack.textContent = cardNumbers[i];
            cardInner.appendChild(cardBack);
    
            card.appendChild(cardInner);
    
            card.addEventListener('click', () => this.handleCardClick(card));
            gameContainer.appendChild(card);
    
            this.grid.push(card);
        }
    }

    updateGridDisplay() {
        const gameContainer = document.querySelector('.game-container');
        gameContainer.style.gridTemplateColumns = `repeat(${this.columns}, ${this.width})`;
        gameContainer.style.gridTemplateRows = `repeat(${this.rows}, ${this.height})`;
    }

    shuffleGrid() {
        for (let i = this.grid.length - 1; i > 0; i--) {
            const randomIndex  = Math.floor(Math.random() * (i + 1));
            [this.grid[i], this.grid[randomIndex ]] = [this.grid[randomIndex ], this.grid[i]];
        }

        this.grid.forEach(card => card.remove());
        this.grid.forEach(card => document.querySelector('.game-container').appendChild(card));
    }

    handleCardClick(card) {
        if (!this.isTimerStarted) {
            this.startTimer();
            this.isTimerStarted = true;
        }

        if (this.lockBoard || this.selectedCards.length >= 2 || card.isFlipped) {
            return;
        }

        this.flipCard(card);
        this.selectedCards.push(card);

        if (this.selectedCards.length === 2) {
            const [card1, card2] = this.selectedCards;
            const number1 = card1.dataset.number;
            const number2 = card2.dataset.number;

            if (number1 === number2) {
                this.selectedCards = [];
            } else {
                this.lockBoard = true;
                setTimeout(() => {
                    this.flipCard(card1);
                    this.flipCard(card2);
                    this.selectedCards = [];
                    this.lockBoard = false;
                }, 1000);
            }
        }

        if (this.grid.every(card => card.classList.contains('card-flipped'))) {
            this.lockBoard = true;
            clearInterval(this.timerInterval);
            this.timerElement.textContent = 'Congratulations! You won!';
        }
    }

    flipCard(card) {
        anime({
            targets: card.querySelector('.card-inner'),
            rotateY: {
                value: '+=180',
                easing: 'easeInOutSine'
            },
            duration: 100
        });
        card.classList.toggle('card-flipped');
    }

    startTimer() {
        let timeLeft = this.timeLimit;
        this.updateTimer(timeLeft);
        
        this.timerInterval = setInterval(() => {
            if (this.isMouseOverGame && !this.gameWrapper.classList.contains('paused')) {
                timeLeft--;
                this.updateTimer(timeLeft);
    
                if (timeLeft <= 0) {
                    clearInterval(this.timerInterval);
                    this.lockBoard = true;
                    this.timerElement.textContent = 'Time is up!';
                }
            }
        }, 1000);
    }

    updateTimer(seconds) {
        this.timerElement.textContent = `Time left: ${seconds} seconds`;
    }

    restartGame() {
        this.lockBoard = true;
        clearInterval(this.timerInterval);
        this.isTimerStarted = false;
        this.timeLimitElement.textContent = this.timeLimit;
        this.timerElement.textContent = `Time left: ${this.timeLimit} seconds`;

        this.grid.forEach(card => card.remove());

        this.grid = [];
        this.selectedCards = [];

        this.createGrid();
        this.shuffleGrid();

        this.lockBoard = false;
    }
}

const memoryGame = new MemoryGame({
    columns: 4,
    rows: 4,
    width: '100px',
    height: '100px',
    timeLimit: 60,
});

