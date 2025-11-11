import { useEffect, useMemo, useState, useRef } from 'react'
import { Button, Space, Typography } from 'antd'
import { ClockCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import './App.css'

const { Title, Text, Paragraph } = Typography

const TIMER_DURATION = 30
const USER_ID_STORAGE_KEY = 'quiz-user-id'

const createUserId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `uid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const QUIZ_QUESTION = {
  category: 'Space & Science',
  prompt: 'Which planet is known as the Red Planet?',
  correctAnswer: 'c',
  options: [
    { id: 'a', text: 'Venus' },
    { id: 'b', text: 'Saturn' },
    { id: 'c', text: 'Mars' },
    { id: 'd', text: 'Mercury' },
  ],
}

function App() {
  const [secondsLeft, setSecondsLeft] = useState(TIMER_DURATION)
  const [selectedOption, setSelectedOption] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(null)
  const [userId, setUserId] = useState(null)
  const [quizHash, setQuizHash] = useState(null)
  const [showStickyTimer, setShowStickyTimer] = useState(false)
  const quizCardRef = useRef(null)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSecondsLeft((current) => (current > 0 ? current - 1 : 0))
    }, 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const existingId = window.localStorage.getItem(USER_ID_STORAGE_KEY)

    if (existingId) {
      setUserId(existingId)
      return
    }

    const newId = createUserId()
    window.localStorage.setItem(USER_ID_STORAGE_KEY, newId)
    setUserId(newId)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const pathSegments = window.location.pathname.split('/').filter(Boolean)
    setQuizHash(pathSegments[0] ?? null)
  }, [])

  useEffect(() => {
    if (!quizHash) {
      return
    }

    const controller = new AbortController()
    const fetchHashData = async () => {
      try {
        await fetch(`https://mdkapi.ipiyush.com/fetch/${quizHash}`, {
          signal: controller.signal,
        })
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch quiz hash data', error)
        }
      }
    }

    fetchHashData()

    return () => controller.abort()
  }, [quizHash])

  useEffect(() => {
    const handleScroll = () => {
      if (quizCardRef.current) {
        const rect = quizCardRef.current.getBoundingClientRect()
        setShowStickyTimer(rect.top < -100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSubmit = () => {
    if (!selectedOption) return
    const correct = selectedOption === QUIZ_QUESTION.correctAnswer
    setIsCorrect(correct)
    setSubmitted(true)
    console.log('Submitted answer:', selectedOption, 'Correct:', correct)
    // Add your submission logic here
  }

  const handleNextQuestion = () => {
    // Reset state for next question
    setSelectedOption(null)
    setSubmitted(false)
    setIsCorrect(null)
    setSecondsLeft(TIMER_DURATION)
    console.log('Moving to next question')
    // Add your next question logic here
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const isLowTime = secondsLeft <= 10

  return (
    <>
      {/* Sticky Timer Bar */}
      <div className={`sticky-timer-bar ${showStickyTimer ? 'visible' : ''}`}>
        <div className="sticky-timer-content">
          <Space align="center" size="small">
            <ClockCircleOutlined style={{ fontSize: '14px' }} />
            <Text strong style={{ fontSize: '14px' }}>
              {formatTime(secondsLeft)}
            </Text>
          </Space>
        </div>
      </div>

      <div className="quiz-container" data-user-id={userId ?? undefined} ref={quizCardRef}>
        <div
          className={`quiz-card-wrapper ${isLowTime ? 'low-time' : ''}`}
          style={{
            '--timer-duration': `${TIMER_DURATION}s`
          }}
        >
          <div className="quiz-card">
          {/* Timer Badge */}
          <div className="timer-badge">
            <Text type="secondary" style={{ fontSize: '13px' }}>Time left:</Text>
            <Text strong style={{ fontSize: '15px', marginLeft: '6px' }}>
              {formatTime(secondsLeft)}
            </Text>
          </div>

          {/* Category Tag */}
          <div className="category-tag">
            {QUIZ_QUESTION.category}
          </div>

          {/* Question Title */}
          <Title level={2} className="question-title">
            {QUIZ_QUESTION.prompt}
          </Title>

          {/* Options Grid */}
          <div className="options-grid">
            {QUIZ_QUESTION.options.map((option) => {
              const isSelected = selectedOption === option.id
              const showResult = submitted && isSelected

              return (
                <div key={option.id} className="option-container">
                  <button
                    className={`option-button ${isSelected ? 'selected' : ''} ${
                      submitted ? 'disabled' : ''
                    } ${showResult ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                    onClick={() => !submitted && setSelectedOption(option.id)}
                    disabled={secondsLeft === 0 || submitted}
                  >
                    {option.text}
                    {showResult && (
                      isCorrect ? (
                        <CheckOutlined className="result-icon correct" />
                      ) : (
                        <CloseOutlined className="result-icon incorrect" />
                      )
                    )}
                  </button>
                  {isSelected && !submitted && (
                    <Button
                      type="primary"
                      size="small"
                      className="quick-submit"
                      onClick={handleSubmit}
                    >
                      Submit
                    </Button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Next Question Button - Only shows after submission */}
          {submitted && (
            <Button
              type="primary"
              size="large"
              className="next-question-button"
              onClick={handleNextQuestion}
              block
            >
              Next Question
            </Button>
          )}

          {/* Helper Text */}
          <Paragraph type="secondary" className="helper-text">
            {submitted
              ? isCorrect
                ? '🎉 Correct! Great job!'
                : '❌ Incorrect. Better luck next time!'
              : secondsLeft === 0
              ? '⏱️ Time is up! Select an answer to continue.'
              : selectedOption
              ? '👆 Click Submit to check your answer'
              : 'Choose the correct answer'}
          </Paragraph>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
