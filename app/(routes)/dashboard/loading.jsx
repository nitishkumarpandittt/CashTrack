import React from 'react'
import { FullPageLoader } from '@/app/_components/LoadingSpinner'

function loading() {
  return (
    <FullPageLoader text="Loading your financial dashboard..." />
  )
}

export default loading