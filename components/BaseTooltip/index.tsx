import React, { CSSProperties, ReactElement } from 'react'
import classnames from 'classnames'
import styled from 'styled-components'
import mobile from 'is-mobile'

import styles from './styles.module.scss'

interface TooltipProps {
  /**
   * tips to show
   */
  title: string
  /**
   * position of the modal
   */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right'
  /**
   * background color
   */
  backgroundColor?: string
  /**
   * font color
   */
  fontColor?: string
  /**
   * the type of active
   */
  trigger?: 'hover' | 'focus' | 'click'
  children?: ReactElement<any, any>
  /**
   * zindex for comment
   */
  zIndex?: number
  /**
   * the classname for whole card
   */
  overlayClassName?: string
  /**
   *  the style for whole card
   */
  overlayStyle?: CSSProperties
}

/**
 * a funtion to format params of props
 */
const formatParms = key => props => props[key]
const isMobile = mobile()

console.log(isMobile, 'ismobile')

const Container = styled.div`
  ::before {
    background-color: ${formatParms('backgroundColor')};
    color: ${formatParms('fontColor')};
    z-index: ${formatParms('zIndex')};
  }
  ::after {
    border-bottom-color: ${formatParms('backgroundColor')};
    z-index: ${formatParms('zIndex')};
  }
`

const BaseTooltip = (props: TooltipProps) => {
  const { children, overlayClassName = '', overlayStyle = {}, title = '', placement = 'top', ...rest } = props

  console.log(title, 'title')
  return (
    <Container
      style={{ ...overlayStyle }}
      data-title={title}
      className={classnames(styles.tooltip, styles[`tooltip-${placement}`], overlayClassName)}
      {...rest}
    >
      {children}
    </Container>
  )
}

export default BaseTooltip
