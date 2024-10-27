import { Metadata } from 'next'
import ProfileContent from './components/ProfileContent'

export const metadata: Metadata = {
  title: 'Profile - Pinterest Clone',
  description: 'User profile page',
}
export default function ProfilePage() {
  return <ProfileContent />
}
