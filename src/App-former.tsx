// import { createResource } from "solid-js"
// import axiosInstance from "./utils/axiosInstance"

// const api_map: ApiMapper = {
//     movies: PATH_MOVIES,
//     series: PATH_SERIES,
//     concerts: PATH_CONCERTS,
//     fairy_tales: PATH_FAIRY_TALES,
//     animated_movies: PATH_ANIMATED_MOVIES,
//     animated_series: PATH_ANIMATED_SERIES,
//     movies_czsk: PATH_MOVIES_CZSK,
//     series_czsk: PATH_SERIES_CZSK,
//     search: PATH_SEARCH_MEDIA
// }

// export default function App() {
//     async function fetchPageData() {
//         const response = axiosInstance.get(MEDIA_ENDPOINT + api_map[page])
//     }

//     const [pageData] = createResource(dataSignals, fetchPageData)

//     return (
//         <div></div>
//     )
// }