import Style from './LoadingDots.module.css'

export const LoadingDots = (
  <svg viewBox="0 0 132 58" style={{ flex: '0 0 100%' }}>
    <g fillRule="evenodd" stroke="none" strokeWidth="1">
      <g>
        <circle className={Style.dot1} cx="25" cy="30" r="13"></circle>
        <circle className={Style.dot2} cx="65" cy="30" r="13"></circle>
        <circle className={Style.dot3} cx="105" cy="30" r="13"></circle>
      </g>
    </g>
  </svg>
)

export default LoadingDots
