import SupplySearch from "./components/SupplySearch";

export default function Home() {
  return (
    <main className="main-container">
      <h1>Dental Inventory System</h1>
      <section className="search-section">
        <h2>Supply Search</h2>
        <SupplySearch />
      </section>
    </main>
  );
}
