"use client";

import { useState } from "react";
import {useEffect} from "react";
import { collection, getDocs, orderBy, query, serverTimestamp, onSnapshot } from "firebase/firestore";
import {db} from "../_utils/firebase";
import InputPost from "./inputpost";
import PostCard from "./postcard";


interface MainFeedProps {
    user: any,
}

export default function MainFeed({user} : MainFeedProps){
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
                
                const unsubscribe= onSnapshot(q, (snapshot) => {
                    setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setLoading(false);
                });
                return () => unsubscribe();
            };
            fetchPosts();
    }, []);
            

            //     const querySnapshot = await getDocs(q);
            //     setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            // } catch (err) {
            //     setError("Error fetching posts: " + (err instanceof Error ? err.message : String(err)));
            // } finally {
            //     setLoading(false);
            // }
    //     };
    //     fetchPosts();
    // }, []);

    return (
        <div className="flex flex-col w-full max-w-2xl mx-auto">
            {/* <h2 className="text-2xl font-bold mb-4 text-white">Your Feed</h2> */}
            {/* <InputPost user={user} /> */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}  
            {!loading && posts.length === 0 && <p>No posts yet!</p> }     
            {posts.map(post => (
                <PostCard key={post.id} post={post} user={user} />
                
            ))}#
            
        </div>
    );
}
