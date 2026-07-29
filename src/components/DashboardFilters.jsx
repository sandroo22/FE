import { FaSearch, FaList, FaThLarge } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function DashboardFilters({ searchQuery, setSearchQuery, filterStatus, setFilterStatus, sortOrder, setSortOrder, viewMode, setViewMode }) {
  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-4">
      <div className="flex flex-col sm:flex-row w-full xl:w-auto gap-2 sm:gap-4">
        <div className="relative w-full sm:w-[250px]">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Cerca in questa cartella..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-background border-muted-foreground/30 focus-visible:ring-primary h-9 text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex h-9 w-full sm:w-[150px] items-center justify-between rounded-md border border-muted-foreground/30 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer">
          <option value="all">Tutti gli stati</option>
          <option value="watched">Solo Già Visti</option>
          <option value="unwatched">Solo Da Vedere</option>
        </select>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="flex h-9 w-full sm:w-[160px] items-center justify-between rounded-md border border-muted-foreground/30 bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer">
          <option value="default">Ordine di aggiunta</option>
          <option value="asc">Titolo (A - Z)</option>
          <option value="desc">Titolo (Z - A)</option>
        </select>
      </div>
      <Tabs value={viewMode} onValueChange={setViewMode} className="w-full xl:w-[200px]">
        <TabsList className="grid w-full grid-cols-2 h-9">
          <TabsTrigger value="list" className="text-sm"><FaList className="h-3 w-3 mr-2" /> Lista</TabsTrigger>
          <TabsTrigger value="grid" className="text-sm"><FaThLarge className="h-3 w-3 mr-2" /> Griglia</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}