import CountrySelector from '@/components/CountrySelector'
import React from 'react'

const FindLocationBar = () => {
  return (
      <div className='flex p-4 bg-card rounded-2xl border border-border shadow-sm'>
          <CountrySelector/>
    </div>
  )
}

export default FindLocationBar