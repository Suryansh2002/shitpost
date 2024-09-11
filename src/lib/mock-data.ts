const posts = [
    {
        id: "1",
        ip: "127.0.0.1",
        title: "Golgappa",
        content: "Golgappa is a popular street food in India. It is a round, hollow puri filled with a mixture of flavored water, tamarind chutney, chili, chaat masala, potato, onion and chickpeas.",
        imageUrl: "/momos.jpg",
        likes: 0,
        dislikes: 0,
        comments: [
            {
                userId: "1",
                content: "This is a comment",
            }
        ]
    },
]

export function getPosts() {
    const localPosts = [];
    for (let i = 0; i < 50; i++) {
        localPosts.push({
            ...posts[0],
            id: (i + 2).toString(),
            imageUrl: ["/momos.jpg","/images.png","/pizza.jpg"][
                Math.floor(Math.random() * 3)
            ],
        });
    }
    return localPosts;
}
