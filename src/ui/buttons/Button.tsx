import { classes, keyframes, style } from 'typestyle'
import { Box } from '../Layout'
import * as Color from '../colors'
import { Icon, IconName } from '../icons/Icon'
import { TextStyles } from '../text/Text'
import Style from './button.module.css'

type TextComponent = typeof Text

const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
})

const spinningClass = style({
  animationName: spinAnimation,
  animationDuration: '1.3s',
  animationIterationCount: 'infinite',
  animationTimingFunction: 'linear',
})

const getPadding = ({
  appearance,
  icon,
  text,
  width,
  height,
  iconPosition,
}: Partial<Props>) => {
  if (appearance === 'text') return 0
  let left = 0 as number | string
  let right = 0 as number | string
  let bottom = 0 as number | string
  let top = 0 as number | string

  if (!width) {
    const leftPadding = iconPosition === 'right' ? '1.2em' : '0.7em'
    left = icon && text ? leftPadding : icon ? '0.4em' : '1.2em'
    right = icon && text ? '1.1em' : icon ? '0.4em' : '1.2em'
  }
  if (text) {
    top = 0 as number | string

    if (!height) {
      top = '0.9em'
      bottom = '0.8em'
    }
  }
  return `${top} ${right} ${bottom} ${left}`
}

const getIconSize = ({ iconSize, fontSize, height }: Partial<Props>) => {
  if (iconSize) return iconSize
  if (fontSize) return fontSize + 2
  if (height) return Math.max(height - 14, 15)
  return 15
}

type Props = {
  text?: string | number
  textStyle?: keyof TextComponent
  onClick?: React.MouseEventHandler
  submit?: boolean
  appearance?: 'solid' | 'outline' | 'text'
  rounded?: boolean
  fontWeight?: number
  color?: Color.Type
  colorWeight?: number
  disabled?: boolean
  loading?: boolean
  minWidth?: React.CSSProperties['minWidth']
  width?: React.CSSProperties['width']
  height?: number
  fontSize?: number
  marginLeft?: number
  marginTop?: number
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none'
  href?: string
  icon?: IconName | null
  iconSize?: number
  iconPosition?: 'left' | 'right'
  iconColor?: Color.Type
  iconColorWeight?: number
  iconMargin?: number
  disableHoverEffect?: boolean
  disableActiveEffect?: boolean
  effectContrast?: number
  /** Cautiously add a custom className */
  className?: string
  /** Cautiously override styles */
  style?: React.CSSProperties
}

/**
 * Component
 */

export const Button = ({
  appearance = 'solid',
  color = 'primary',
  textStyle,
  icon,
  iconSize,
  text,
  onClick,
  submit = false,
  fontWeight = 700,
  colorWeight = 500,
  disabled = false,
  loading = false,
  marginLeft,
  marginTop,
  minWidth,
  width,
  height,
  fontSize,
  iconMargin,
  href,
  textTransform,
  iconColor,
  iconColorWeight,
  iconPosition = 'left',
  className = '',
  disableActiveEffect = false,
  disableHoverEffect = false,
  rounded = true,
  effectContrast = 1,
  style: _style = {},
}: Props) => {
  iconSize = getIconSize({ iconSize, fontSize, height })
  icon = loading ? 'LoadingSpinner' : icon
  effectContrast = effectContrast ?? (appearance === 'text' ? 2 : 1)

  const colors = {
    base: Color[color](colorWeight),
    lighter: Color[color](colorWeight - 100 * effectContrast),
    darker: Color[color](colorWeight + 100 * effectContrast),
  }
  const propClass = style({
    outlineColor: colors.base,
    fontWeight,
  })

  let appearanceClass = ''
  if (appearance === 'outline') {
    appearanceClass = style({
      backgroundColor: 'transparent',
      border: `2px solid ${colors.base}`,
      color: colors.base,
      $nest: {
        '&:hover': {
          ...(!disableHoverEffect && {
            backgroundColor: colors.lighter,
            borderColor: colors.lighter,
            color: 'white',
          }),
        },
        '&:active': {
          ...(!disableActiveEffect && {
            backgroundColor: colors.base,
            borderColor: colors.base,
            outlineWidth: 2,
            color: 'white',
          }),
        },
      },
    })
  } else if (appearance === 'solid') {
    appearanceClass = style({
      backgroundColor: colors.base,
      border: `2px solid ${colors.base}`,
      color: 'white',
      $nest: {
        '&:hover': {
          ...(!disableHoverEffect && {
            backgroundColor: colors.lighter,
            borderColor: colors.lighter,
          }),
        },
        '&:active': {
          ...(!disableActiveEffect && {
            backgroundColor: colors.base,
            borderColor: colors.base,
            outlineWidth: 2,
          }),
        },
      },
    })
  } else if (appearance === 'text') {
    appearanceClass = style({
      outline: 'none',
      backgroundColor: 'transparent',
      color: colors.base,
      textTransform: textTransform || 'none',
      fontStyle: 'normal',
      $nest: {
        '&:hover': {
          ...(!disableHoverEffect && {
            color: colors.lighter,
          }),
        },
        '&:active': {
          ...(!disableActiveEffect && {
            color: colors.base,
          }),
        },
      },
    })
  }

  const Component = TextStyles[textStyle]

  const node = (
    <button
      className={classes(Style.button, appearanceClass, propClass, className)}
      onClick={(e) => {
        if (href) e.stopPropagation()
        if (loading || disabled) return
        if (onClick) onClick(e)
      }}
      disabled={disabled}
      {...(submit && {
        type: 'submit',
      })}
      style={{
        width: href ? '100%' : width,
        fontSize,
        height,
        minWidth: width || minWidth || 'max-content',
        padding: getPadding({
          appearance,
          icon,
          text,
          width,
          height,
          iconPosition,
        }),
        marginLeft,
        marginTop,
        flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
        ...(disabled
          ? {
              pointerEvents: 'none',
              opacity: 0.3,
            }
          : {}),
        ...(textTransform && {
          textTransform,
        }),
        ...(loading && {
          pointerEvents: 'none',
        }),
        ...(rounded && {
          borderRadius: 100,
        }),
        ..._style,
      }}
    >
      {(icon || loading) && (
        <Box
          className={loading ? spinningClass : undefined}
          style={{
            fontSize: iconSize,
            [`margin${iconPosition === 'right' ? 'Left' : 'Right'}`]:
              typeof iconMargin !== 'undefined'
                ? iconMargin
                : text
                ? '0.4em'
                : 0,
          }}
        >
          <Icon
            color={iconColor}
            colorWeight={iconColorWeight}
            name={icon}
            /* Needed because Kievet font is offset upward */
            nudgeUp={text && !loading ? '0.1em' : 0}
            height={iconSize}
            width={iconSize}
          />
        </Box>
      )}
      {Component ? (
        <Component
          text={text}
          tagName="span"
          fontWeight={fontWeight}
          fontSize={fontSize}
        />
      ) : (
        text
      )}
    </button>
  )

  return href ? (
    <a
      // Reset styles
      style={{
        color: 'inherit',
        background: 'inherit',
        fontSize: 'inherit',
        opacity: 'inherit',
        position: 'relative',
        textDecoration: 'none',
        width,
        minWidth: width || minWidth || 'max-content',
      }}
      href={href}
    >
      {node}
    </a>
  ) : (
    node
  )
}

/**
 * Helpers
 */

export const CancelButton = (props: Props) => (
  <Button
    text="Cancel"
    appearance="text"
    color="neutral"
    textTransform="uppercase"
    colorWeight={300}
    height={22}
    width={68}
    fontSize={14}
    {...props}
    style={{ fontStyle: 'italic', ...(props.style || {}) }}
  />
)

type IconButtonProps = {
  icon: IconName
  size?: number
} & Omit<
  Partial<ButtonProps>,
  'iconColor' | 'iconColorWeight' | 'iconSize' | 'height' | 'width'
>

export const IconButton = (props: IconButtonProps) => {
  const {
    size = 24,
    icon = 'Star',
    color = 'neutral',
    colorWeight = 400,
    ...passthroughProps
  } = props

  return (
    <Button
      icon={icon}
      iconSize={size}
      color={color}
      colorWeight={colorWeight}
      appearance="text"
      effectContrast={4}
      {...passthroughProps}
    />
  )
}

type IconButtonCircleProps = {
  icon: IconName
  iconSize?: number
} & Partial<ButtonProps>

export const IconButtonCircle = (props: IconButtonCircleProps) => {
  const {
    width = 32,
    height = 32,
    iconSize,
    icon = 'Star',
    iconColor,
    iconColorWeight = 0,
    color = 'neutral',
    colorWeight = 800,
    ...passthroughProps
  } = props

  return (
    <Button
      icon={icon}
      color={color}
      colorWeight={colorWeight}
      iconSize={iconSize || Math.ceil(height / 1.5)}
      iconColor={iconColor}
      iconColorWeight={iconColorWeight}
      height={height}
      width={width}
      effectContrast={2}
      {...passthroughProps}
    />
  )
}

type ToggleButtonProps = {
  isOn: boolean
  onChange: (isOn: boolean) => void
}
export const ToggleIconButton = ({ isOn, onChange }: ToggleButtonProps) => {
  return (
    <IconButton
      icon="Microphone"
      color={isOn ? 'primary' : 'secondary'}
      colorWeight={500}
      onClick={() => {
        onChange(!isOn)
      }}
    />
  )
}

export type ButtonProps = Props
