import { useEffect, useMemo, useState } from 'react'
import './App.css'

const TIMER_DURATION = 30

const QUIZ_QUESTION = {
  category: 'Space & Science',
  prompt: 'Which planet is known as the Red Planet?',
  options: [
    { id: 'a', label: 'A', text: 'Venus' },
    { id: 'b', label: 'B', text: 'Saturn' },
    { id: 'c', label: 'C', text: 'Mars' },
    { id: 'd', label: 'D', text: 'Mercury' },
  ],
}

function App() {
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION)
  const [selectedOption, setSelectedOption] = useState(null)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  const timerPercent = useMemo(
    () => (secondsLeft / TIMER_DURATION) * 100,
    [secondsLeft],
  )

  return (
    <main className="quiz-layout">
      <header className="timer-card">
        <p className="eyebrow">Daily Quiz · Question 1</p>
        <div className="timer-row">
          <span className="timer-label">Time Left</span>
          <span className={`timer-value ${secondsLeft === 0 ? 'elapsed' : ''}`}>
            {secondsLeft}s
          </span>
        </div>
        <div className="timer-track" role="presentation">
          <div
            className="timer-progress"
            style={{ width: `${timerPercent}%` }}
            aria-hidden
          />
        </div>
      </header>

      <section className="question-card" aria-live="polite">
        <p className="eyebrow">{QUIZ_QUESTION.category}</p>
        <h1>{QUIZ_QUESTION.prompt}</h1>

        <div className="options-grid">
          {QUIZ_QUESTION.options.map((option) => {
            const isSelected = selectedOption === option.id
            return (
              <button
                type="button"
                key={option.id}
                className={`option ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option.id)}
                disabled={secondsLeft === 0}
              >
                <span className="option-label">{option.label}</span>
                <span className="option-text">{option.text}</span>
              </button>
            )
          })}
        </div>

        <p className="helper-text">
          {secondsLeft === 0
            ? 'Time is up! Your selection is locked in.'
            : 'Tap an option to lock in your answer.'}
        </p>
      </section>
    </main>
  )
}

export default App
