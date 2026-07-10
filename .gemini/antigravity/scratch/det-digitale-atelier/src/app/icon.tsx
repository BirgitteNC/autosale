import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: '#FAF9F6', // Sand/Beige baggrund
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1A1816', // Mørkebrun/sort tekst
          fontFamily: 'serif',
          border: '1px solid #E5E0D8',
          borderRadius: '6px',
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
