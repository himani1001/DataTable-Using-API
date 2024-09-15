import { useEffect, useState, useRef } from "react";
import { DataTable, DataTableStateEvent, DataTableSelectionMultipleChangeEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import { OverlayPanel } from 'primereact/overlaypanel';
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';

const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lazyParams, setLazyParams] = useState({ first: 0, page: 0, rows: 12 });
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [rowClick, setRowClick] = useState(false);
  const [inputRowsToSelect, setInputRowsToSelect] = useState<string>(''); 
  const op = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number) => {
    try {
      const response = await axios.get(`https://api.artic.edu/api/v1/artworks?page=${page}&limit=${lazyParams.rows}`);
      return response.data.data;
    } catch (err) {
      console.error("Failed to fetch data from the API", err);
    }
  };

  const onPage = async (event: DataTableStateEvent) => {
    setLoading(true);
    const page = event.page !== undefined ? event.page : 0;
    setLazyParams((prev) => ({ ...prev, first: event.first, page, rows: event.rows }));
    const artworks = await fetchArtworks(page + 1); 
    setPosts(artworks);
    setLoading(false);
  };

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      const artworks = await fetchArtworks(1);
      setPosts(artworks);
      setTotalRecords(100); 
      setLoading(false);
    };
    initialFetch();
  }, []);

  const handleSubmit = async () => {
    const numberOfRows = parseInt(inputRowsToSelect, 10);
    if (isNaN(numberOfRows) || numberOfRows <= 0) {
      alert('Please enter a valid number of rows');
      return;
    }

    setLoading(true);
    
    let rowsToSelect = numberOfRows;
    let selectedRows: any[] = [];
    let page = 1;

    while (rowsToSelect > 0) {
      const artworks = await fetchArtworks(page);
      const rowsOnThisPage = Math.min(rowsToSelect, artworks.length);
      selectedRows = [...selectedRows, ...artworks.slice(0, rowsOnThisPage)];
      rowsToSelect -= rowsOnThisPage;
      page += 1;
    }

    setSelectedProducts(selectedRows);
    setLazyParams((prev) => ({ ...prev, page: 0 }));
    setLoading(false);
  };

  const onSelectionChange = (e: DataTableSelectionMultipleChangeEvent<any>) => {
    setSelectedProducts(e.value || []);
  };

  return (
    <div>
      <h2>Artwork Collection</h2>
      
      {/* Input Switch Section */}
      <div style={{ padding: '20px 0' }}>
        <span>Select Mode:</span>
        <InputSwitch checked={!rowClick} onChange={(e) => setRowClick(!e.value)} />
      </div>

      {/* Overlay Panel for selecting rows */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <FaChevronDown
          style={{ marginLeft: '10px', cursor: 'pointer' }}
          onClick={(e) => op.current?.toggle(e)}
        />
        <OverlayPanel ref={op} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Select rows..."
              value={inputRowsToSelect}
              onChange={(e) => setInputRowsToSelect(e.target.value)} 
              style={{ padding: '5px', width: '150px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button
              onClick={handleSubmit}
              style={{
                marginLeft: '10px',
                padding: '5px 10px',
                backgroundColor: 'white',
                border: '1px solid black',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </div>
        </OverlayPanel>
      </div>

      {/* DataTable Section */}
      <DataTable
        value={posts}
        paginator
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        lazy
        loading={loading}
        onPage={onPage}
        first={lazyParams.first}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
        rowsPerPageOptions={[12, 24, 36, 48, 60]}
        dataKey="id"
        selectionMode={rowClick ? 'checkbox' : null}
        selection={selectedProducts}
        onSelectionChange={onSelectionChange}
      >
        {!rowClick && (
          <Column
            selectionMode="multiple"
            headerStyle={{ width: '3rem' }}
            bodyStyle={{ textAlign: 'center' }}
          />
        )}
        <Column field="title" header="Title" style={{ width: '25%' }} />
        <Column field="place_of_origin" header="Place Of Origin" style={{ width: '25%' }} />
        <Column field="artist_display" header="Artist Display" style={{ width: '25%' }} />
        <Column field="date_start" header="Date Start" style={{ width: '15%' }} />
        <Column field="date_end" header="Date End" style={{ width: '15%' }} />
      </DataTable>
    </div>
  );
};

export default Home;
