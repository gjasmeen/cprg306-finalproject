import { useEffect, useState } from "react";
import { db } from "../_utils/firebase";
import { collection, addDoc, orderBy, query, onSnapshot } from "firebase/firestore";

type Post = {
    id: string;
    content: string;
    timestamp: {
        seconds: number;
    };
    imageUrl?: string;
    userId?: string;
};

export default function PostCard({ post,user }: { post: Post;user: any }) {
    const [commentText, setCommentText] = useState("");
    const [comments, setCommentsList] = useState<any[]>([]);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (!showComments) return;


        const q = query(collection(db, "posts", post.id, "comments"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setCommentsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => unsubscribe();
    }, [post.id, showComments]);

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (commentText.trim() === "") return;
        try {
            await addDoc(collection(db, "posts", post.id, "comments"), {
                content: commentText,
                timestamp: new Date(),
                userId: user.uid 
            });
            setCommentText("");
        } catch (err) {
            console.error("Error adding comment: ", err);
        }
    };


    return (
    <div className="bg-[#1a1a1a] p-4 rounded-lg mb-4 text-white">
        <p className="text-white">{post.content}</p>
        <p className="text-gray-500 text-sm mt-2">{post.timestamp?.seconds ? new Date(post.timestamp.seconds * 1000).toLocaleString() : "Loading..."}</p>
        {post.imageUrl && <img src={post.imageUrl} alt="Post Image" className="mt-4 rounded"
        //alt="post" 
            />}
        <div className="flex space-x-4 mt-4 text-gray-500">
            <span
            className="cursor-pointer hover:text-white"
            onClick={() => setShowComments(!showComments)}
            > comment</span>
            <span>share</span>
        </div>  


        {/* Comment input */}
      <div className="mt-3">
        {showComments && (
            <div className="mt-4">
                <div className="space-y-2">
                {comments.map((c) => (
                    <div key={c.id} className="text-gray-300 text-sm bg-[#2a2a2a] p-2 rounded">
                    {c.content} {/* You can also display commenter name, timestamp, etc. here */}
                    </div>

                ))}
                
                </div>
                <form onSubmit={handleCommentSubmit} className="flex mt-3">
                        <input
                        className="flex-1 bg-[#333] text-white p-2 rounded-l"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        />
                        <button
                        type="submit"
                        className="bg-yellow-400 text-black px-4 rounded-r font-semibold"
                        >
                        Comment
                        </button>
                </form>
            </div>
        )}
        </div>
    </div> 
    );
}