import React, { useEffect } from "react"

import { animated, useSpring } from "react-spring"
import { useDrag } from "react-use-gesture"
import {
  StyledNotification,
  StyledNotificationContainer,
  StyledContainer
} from "./styled-components"
import { findNearestNumberInArray, projection, clamp } from "../utilities"

const yStops = [0, 100]
const threshold = 10

const Notification = ({ children, hideNotification }) => {
  const [{ y }, set] = useSpring(() => ({ y: yStops[1] }))

  const [{ v }, setVelocityTracker] = useSpring(() => ({
    v: yStops[1]
  }))

  useEffect(() => {
    set({ y: 0 })
    setVelocityTracker({ velocityTracker: 0 })
  }, [set, setVelocityTracker])

  const bind = useDrag(
    ({ last, movement: [, movementY], vxvy: [, velocityY], memo }) => {
      if (!memo) {
        const isIntentionalGesture = Math.abs(movementY) > threshold
        if (!isIntentionalGesture) {
          return
        }
        memo = y.value + (movementY < 0 ? threshold : -threshold)
      }

      if (last) {
        const projectedEndpoint = y.value + projection(velocityY)
        const point = findNearestNumberInArray(projectedEndpoint, yStops)

        const notificationClosed = point === yStops[1]

        return set({
          y: notificationClosed ? yStops[1] : yStops[0],
          onRest: notificationClosed ? hideNotification : () => {},
          immediate: false,
          config: {
            velocity: v.lastVelocity
          }
        })
      }

      const newY = clamp(yStops[0], yStops[1], memo + movementY)

      setVelocityTracker({
        v: newY
      })
      set({
        y: newY,
        immediate: true
      })

      return memo
    }
  )

  return (
    <StyledNotificationContainer>
      <StyledNotification
        as={animated.div}
        onTouchStart={bind().onTouchStart}
        style={{
          opacity: y.interpolate(yStops, [1, 0]),
          transform: y.interpolate(y => `translate3D(-50%, ${y}px, 0)`)
        }}
      >
        {children}
      </StyledNotification>
    </StyledNotificationContainer>
  )
}

const NotificationDemo = () => {
  const [notificationVisible, setNotificationVisible] = React.useState(false)

  return (
    <StyledContainer>
      <button
        onClick={() => {
          setNotificationVisible(prevShow => !prevShow)
        }}
      >
        👇 show notification
      </button>
      {notificationVisible && (
        <Notification
          visible={notificationVisible}
          hideNotification={() => {
            setNotificationVisible(false)
          }}
        >
          <div>🐶</div>
          <div>&nbsp;&nbsp;just saying hi</div>
        </Notification>
      )}
    </StyledContainer>
  )
}

export default NotificationDemo
