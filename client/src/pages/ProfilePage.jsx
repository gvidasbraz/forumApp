import React, { useEffect, useState } from 'react';
import { useStore } from '../store/myStore';
import http from '../plugins/http';

function ProfilePage() {
  const { user, setUser } = useStore();
  const [newProfileImage, setNewProfileImage] = useState('');
  const [msg, setMsg] = useState();
  const [userDiscussions, setUserDiscussions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user.length !== 0) {
      getUserDiscussions();
      getUserAnswers();
    }
  }, [user]);

  const getUserDiscussions = async () => {
    try {
      const response = await http.get(`discussions/token/${token}`);
      setUserDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };
  const getUserAnswers = async () => {
    try {
      const response = await http.get(`answers/token/${token}`);
      setUserAnswers(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const handleUpdateProfileImage = () => {
    http
      .post('changeProfilePicture', { token, newProfileImage })
      .then((response) => {
        if (response.success) {
          console.log(response);
          setUser({
            id: response._id,
            username: response.username,
            role: response.role,
            profileImage: response.profileImage,
          });
        }
        setMsg(response.message);
        setNewProfileImage('');
      });
  };

  return (
    <div>
      {user.length === 0 ? (
        <p>Please log in to use profile page.</p>
      ) : (
        <div>
          <div className='user-profile'>
            <div className='user-image'>
              <img src={user.profileImage} alt='' />
              <div className='user-image-inputs'>
                <input
                  className='image-input'
                  type='text'
                  placeholder='New image URL'
                  value={newProfileImage}
                  onChange={(e) => setNewProfileImage(e.target.value)}
                />
                {msg && <div className='error'>{msg}</div>}
                <button onClick={handleUpdateProfileImage}>
                  Update Profile Image
                </button>
              </div>
            </div>
            <div className='profile-wrapper'>
              <div>
                <div className='username'>Logged in as: {user.username}</div>
                <div className='user-role'>Role: {user.role}</div>
              </div>
              <div className='user-profile-posts'>
                <div>
                  <div className='user-profile-posts-title'>
                    Discussions created by {user.username}:
                  </div>
                  <div className='posts-container'>
                    {userDiscussions &&
                      userDiscussions.map((disc) => (
                        <div key={disc._id} className='posts'>
                          <h4>{disc.Title}</h4>
                          <p> {disc.Description}</p>
                        </div>
                      ))}
                  </div>
                </div>
                <div>
                  <div className='user-profile-posts-title'>
                    Answers written by {user.username}:
                  </div>
                  <div className='posts-container'>
                    {userAnswers &&
                      userAnswers.map((answer) => (
                        <div key={answer._id} className='posts'>
                          {answer.Content}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
