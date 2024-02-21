import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/Footer';
import Toolbar from './components/Toolbar';
import ForumPage from './pages/ForumPage';
import TopicPage from './pages/TopicPage';
import DiscussionPage from './pages/DiscussionPage';
import MessagesPage from './pages/MessagesPage';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <Toolbar />
        <Routes>
          <Route path='/auth' element={<AuthPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/forum' element={<ForumPage />} />
          <Route path='/messages' element={<MessagesPage />} />
          <Route path='/forum/:topicName' element={<TopicPage />} />
          <Route
            path='/forum/:topicName/:discussionId'
            element={<DiscussionPage />}
          />
          <Route index element={<AuthPage />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
