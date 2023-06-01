
export const Checkmark = (
  <svg
    style={{
      flex: '0 0 100%',
      borderRadius: '50%',
      display: 'block',
      strokeWidth: 2,
      stroke: '#26ad80',
      strokeMiterlimit: 10,
      boxShadow: 'inset 0 0 0 #26ad80',
      animation:
        'fill .5s ease-in-out .5s forwards,scale .5s ease-in-out .9s both',
    }}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 52 52"
  >
    <style>
      {
        '@keyframes stroke{to{stroke-dashoffset:0}}@keyframes scale{0%,to{transform:scale3d(.85,.85,1)}50%{transform:scale3d(.95,.95,1)}}@keyframes fill{to{box-shadow:inset 0 0 0 60px transparent}}'
      }
    </style>
    <circle
      cx={26}
      cy={26}
      r={25}
      fill="none"
      style={{
        strokeDasharray: 166,
        strokeDashoffset: 166,
        strokeWidth: 2,
        strokeMiterlimit: 10,
        stroke: '#26ad80',
        fill: 'none',
        animation: 'stroke .6s cubic-bezier(.65,0,.45,1) forwards',
      }}
    />
    <path
      fill="none"
      d="m14.1 27.2 7.1 7.2 16.7-16.8"
      style={{
        transformOrigin: '50% 50%',
        strokeDasharray: 48,
        strokeDashoffset: 48,
        animation: 'stroke .3s cubic-bezier(.65,0,.45,1) .8s forwards',
      }}
    />
  </svg>
)
