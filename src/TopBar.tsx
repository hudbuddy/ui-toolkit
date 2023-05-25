import { Icon } from "./ui"

export const TopBar = () => {
  return (
    <div
      style={{
        display: 'flex',
        background: 'rgba(0,0,0,40%)',
        width: '100%',
        height: 60,
        flexShrink: 0,
        alignItems: 'center',
        padding: 16,
      }}
    >
      <Icon name="Lightstream" fontSize={30} />
    </div>
  )
}
