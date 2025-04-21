import './loadingScreen.css';


const loadingScreen = () => {
    return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p>로딩 중...</p>
        </div>
    )
};

export default loadingScreen;