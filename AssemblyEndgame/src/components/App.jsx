import { useState } from "react"
import { clsx } from "clsx"
import Confetti from "react-confetti"
import { languages } from "../assets/languages"
import { words } from "../assets/words"
import { getFarewellText } from "../assets/utils"

export default function AssemblyEndgame() {
    // State values
    const [currentWord, setCurrentWord] = useState(() => setRandomWord())
    const [guessedLetters, setGuessedLetters] = useState([])
    
    // Derived values
    const wrongGuessCount = 
        guessedLetters.filter(letter => !currentWord.includes(letter)).length

    const numGuessesLeft = languages.length - 1
    const isGameLost = wrongGuessCount >= numGuessesLeft
    const isGameWon = currentWord.split("").every((letter) => guessedLetters.includes(letter))
    const isGameOver = isGameLost || isGameWon
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]

    var globalMistakeStatus = false;
    var globalMistakeStatusMessage = '';
    if (wrongGuessCount > 0 && !currentWord.includes(guessedLetters[guessedLetters.length - 1])){
        globalMistakeStatus = true;
        globalMistakeStatusMessage = getFarewellText(languages[wrongGuessCount - 1].name);
    }
    
    // Static values
    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function setRandomWord(){
        let random = Math.floor(Math.random() * words.length);
        let choice = words[random];
        return choice;
    }

    function resetGame(){
        setCurrentWord(setRandomWord())
        setGuessedLetters([])
    }

    function addGuessedLetter(letter) {
        setGuessedLetters(prevLetters =>
            prevLetters.includes(letter) ?
                prevLetters :
                [...prevLetters, letter]
        )
    }

    const languageElements = languages.map((lang, index) => {
        const isLanguageLost = index < wrongGuessCount
        const styles = {
            backgroundColor: lang.backgroundColor,
            color: lang.color
        }
        //const className = clsx("chip", isLanguageLost && "lost")
        return (
            <span
                className={`chip ${isLanguageLost ? "lost" : ""}`}
                style={styles}
                key={lang.name}
            >
                {lang.name}
            </span>
        )
    })

    const letterElements = currentWord.split("").map((letter, index) => {
        const letterClassName = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )
        return <span key={index} className={letterClassName}>
            {guessedLetters.includes(letter) || isGameOver ? letter.toUpperCase() : ""}
        </span>
    })

    const keyboardElements = alphabet.split("").map(letter => {
        const isGuessed = guessedLetters.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })
        
        return (
            <button
                className={className}
                key={letter}
                onClick={() => addGuessedLetter(letter)}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                disabled={isGameOver}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        mistake: globalMistakeStatus && !isGameLost
    })

    function renderGameStatus() {
        if (!isGameOver) {
            if (globalMistakeStatus){
                return (
                    <>
                        <p>{globalMistakeStatusMessage}</p>
                    </>
                )
            }else{
                return null
            }
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            )
        } else {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                </>
            )
        }
    }

    return (
        <main>
            {isGameWon && <Confetti 
                recycle={false}
                numberOfPieces={1000}
            />}

            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within 8 attempts to keep the
                programming world safe from Assembly!</p>
            </header>


            <section 
                aria-live="polite" 
                role="status" 
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>


            <section className="language-chips">
                {languageElements}
            </section>

            <section className="word">
                {letterElements}
            </section>

            {/* Combined visually-hidden aria-live region for status updates */}
            <section 
                className="sr-only" 
                aria-live="polite" 
                role="status"
            >
                <p>
                    {currentWord.includes(lastGuessedLetter) ? 
                        `Correct! The letter ${lastGuessedLetter} is in the word.` : 
                        `Sorry, the letter ${lastGuessedLetter} is not in the word.`
                    }
                    You have {numGuessesLeft} attempts left.
                </p>
                <p>Current word: {currentWord.split("").map(letter => 
                guessedLetters.includes(letter) ? letter + "." : "blank.")
                .join(" ")}</p>
            </section>

            <section className="keyboard">
                {keyboardElements}
            </section>
            {isGameOver && 
                <button 
                className="new-game"
                onClick={resetGame}>
                    New Game
                </button>}
        </main>
    )
}
