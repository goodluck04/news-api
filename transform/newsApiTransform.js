import { getImageUrl } from "../utils/helper.js";

class NewsApiTransform {
    static transform(news) {
        return {
            id: news.id,
            heading: news.title,
            news: news.content,
            image: getImageUrl(news.image),
            created_at: news.created_at,
            reporter:{
                id:news?.user.id,
                name:news?.user?.name,
                // you can return profile link image instead of null
                profile: news?.user?.profile ? getImageUrl(news?.user?.profile) : null,
            }
        }
    }
}

export default NewsApiTransform;