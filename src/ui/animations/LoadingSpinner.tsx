import { classes } from 'typestyle'
import Style from './LoadingSpinner.module.css'

export const LoadingSpinner = (
  <svg
    x="0"
    y="0"
    enableBackground="new 0 0 500 500"
    viewBox="0 0 500 500"
    style={{ flex: '0 0 100%' }}
  >
    <g className={Style.st0}>
      <path d="M0 0H500V500H0z" className={Style.st1}></path>
    </g>
    <g className={Style.st0}>
      <g className={Style.st2}>
        <defs>
          <circle id="SVGID_1_" cx="250" cy="250" r="235.3"></circle>
        </defs>
        <clipPath>
          <use overflow="visible" xlinkHref="#SVGID_1_"></use>
        </clipPath>
        <g className={Style.st3}>
          <path d="M278 487L49.3 89.2" className={Style.st4}></path>
          <path d="M215.3 487L-13.3 89.2" className={Style.st4}></path>
          <path d="M335.7 480.5L90.3 54" className={Style.st4}></path>
          <path d="M397.4 480.1L140 33.6" className={Style.st4}></path>
          <path d="M458.5 479.1L191.1 15.6" className={Style.st4}></path>
          <path d="M164 480.5L406.3 61" className={Style.st4}></path>
          <path d="M102 480.1L358.7 35.6" className={Style.st4}></path>
          <path d="M43.2 475.4L310.9 11.9" className={Style.st4}></path>
          <path d="M221.3 487L450.9 89.2" className={Style.st4}></path>
          <path d="M282.8 487L512.4 89.2" className={Style.st4}></path>
          <path d="M35.6 130.8L464.1 130.8" className={Style.st4}></path>
          <path d="M9.6 184L479.3 184" className={Style.st4}></path>
          <path d="M9.6 224L486.3 224" className={Style.st4}></path>
          <path d="M9.6 278.3L485.3 278.3" className={Style.st4}></path>
          <path d="M9.6 331.5L474.3 331.5" className={Style.st4}></path>
          <path d="M249.9 492L249.9 4" className={Style.st4}></path>
          <path d="M35.6 437.9L464.1 437.9" className={Style.st4}></path>
        </g>
        <use
          fill="none"
          stroke="#1C1C1C"
          strokeMiterlimit="10"
          overflow="visible"
          xlinkHref="#SVGID_1_"
        ></use>
      </g>
    </g>
    <g>
      <path
        d="M250 403.5L332.7 260.3 276.1 251.6 250 296.7z"
        className={classes(Style.st5, Style.one)}
      ></path>
      <path
        d="M250 403.5L151.2 232.3 218.8 242.8 250 296.7z"
        className={classes(Style.st5, Style.two)}
      ></path>
      <path
        d="M195.5 202.3L165.2 149.9 72.7 96.5 138.9 211.1z"
        className={classes(Style.st5, Style.three)}
      ></path>
      <path
        d="M72.7 96.5L165.2 149.9 250.1 149.9 250.1 96.5z"
        className={classes(Style.st5, Style.four)}
      ></path>
      <path
        d="M427.3 96.5L250.1 96.5 250.1 149.9 334.8 149.9z"
        className={classes(Style.st5, Style.five)}
      ></path>
      <path
        d="M334.8 149.9L315.1 183.9 382.8 173.4 427.3 96.5z"
        className={classes(Style.st5, Style.six)}
      ></path>
    </g>
  </svg>
)

export default LoadingSpinner
