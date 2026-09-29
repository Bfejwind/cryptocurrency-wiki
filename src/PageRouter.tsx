import WikiApp from './WikiApp'
import LearningGuide from './LearningGuide'
import LearningLesson from './LearningLesson'

export default function PageRouter() {
  const page = window.location.pathname.replace(/\/+$/, '')
  if (page === '/learn') return <LearningGuide />
  if (page.startsWith('/learn/')) return <LearningLesson lessonId={decodeURIComponent(page.slice('/learn/'.length))} />
  return <WikiApp />
}