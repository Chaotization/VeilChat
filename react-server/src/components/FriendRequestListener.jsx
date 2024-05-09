import React, { useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

const FriendRequestListener = ({ onRequestReceived,onRequestAccepted, otherUserId }) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const firestore = getFirestore();

    useEffect(() => {
        if (currentUser) {
            console.log("test",otherUserId)
            const friendsDocRef = doc(firestore, `users/${currentUser.uid}`);
            const unsubscribe = onSnapshot(
                friendsDocRef,
                (snapshot) => {
                    const userData = snapshot.data();

                    if (userData && userData.friendRequests) {
                        const pendingFriendRequests = userData.friendRequests.filter(
                            (request) => (request.status === 'pending' && request.friendId===otherUserId)
                        );

                        const AcceptedRequests = userData.friendRequests.filter(
                            (request) => (request.status === 'accepted' && request.friendId===otherUserId)
                        );

                        const friendNotExist = userData.friendRequests.filter(
                            (request) => (request.friendId===otherUserId)
                        );


                        if (pendingFriendRequests.length > 0) {
                            pendingFriendRequests.forEach((request) => {
                                onRequestReceived({ requesterId: request.friendId });
                            });
                        }

                        if (AcceptedRequests.length > 0) {
                            AcceptedRequests.forEach((request) => {
                                onRequestAccepted({ requesterId: request.friendId });
                            });
                        }
                    }
                },
                (error) => {
                    console.error('Error listening to friend requests:', error);
                }
            );

            return () => unsubscribe();
        } else {
            console.warn('No current user detected for FriendRequestListener');
        }
    }, [currentUser, onRequestReceived]);

    return null;
};

export default FriendRequestListener;
