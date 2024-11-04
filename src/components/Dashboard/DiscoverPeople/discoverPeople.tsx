import ProtectedComponent from "@/components/ProtectedComponent/protected-page";

 const DiscoverPeople: React.FC = () =>{
    return (
        <div>
        <ProtectedComponent />

        <div>Discover People</div>
        </div>
    )

}

export default DiscoverPeople;