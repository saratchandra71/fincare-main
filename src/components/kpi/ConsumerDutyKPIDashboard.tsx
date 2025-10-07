import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { ProductsServicesKPI } from "./ProductsServicesKPI";
import { PriceValueKPI } from "./PriceValueKPI";
import { ConsumerUnderstandingKPI } from "./ConsumerUnderstandingKPI";
import { ConsumerSupportKPI } from "./ConsumerSupportKPI";

interface FilteredData {
  productData: any[];
  priceData: any[];
  communicationData: any[];
  supportData: any[];
}

export function ConsumerDutyKPIDashboard() {
  const { allDatasetsLoaded, datasets } = useData();
  const [selectedOutcome, setSelectedOutcome] = useState<string>("all");
  const [selectedProductType, setSelectedProductType] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [filteredData, setFilteredData] = useState<FilteredData>({
    productData: [],
    priceData: [],
    communicationData: [],
    supportData: []
  });
  const [productTypes, setProductTypes] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);

  const outcomes = [
    { value: "all", label: "All Outcomes" },
    { value: "products-services", label: "Products & Services" },
    { value: "price-value", label: "Price & Value" },
    { value: "consumer-understanding", label: "Consumer Understanding" },
    { value: "consumer-support", label: "Consumer Support" }
  ];

  useEffect(() => {
    if (!allDatasetsLoaded) return;

    loadAllData();
  }, [allDatasetsLoaded]);

  useEffect(() => {
    if (filteredData.productData.length > 0) {
      applyFilters();
    }
  }, [selectedProductType, selectedProduct]);

  const loadAllData = async () => {
    try {
      // Load all CSV files
      const [productResponse, priceResponse, commResponse, supportResponse] = await Promise.all([
        fetch('/data/ProductPerformance.csv'),
        fetch('/data/PriceValue.csv'),
        fetch('/data/ConsumerUnderstanding.csv'),
        fetch('/data/ConsumerSupport.csv')
      ]);

      const [productText, priceText, commText, supportText] = await Promise.all([
        productResponse.text(),
        priceResponse.text(),
        commResponse.text(),
        supportResponse.text()
      ]);

      // Parse CSV data
      const productData = parseCSV(productText);
      const priceData = parseCSV(priceText);
      const communicationData = parseCSV(commText);
      const supportData = parseCSV(supportText);

      // Extract unique product types and products
      const uniqueProductTypes = [...new Set(productData.map(row => row.Product_Type))].filter(Boolean);
      const uniqueProducts = [...new Set(productData.map(row => row.Product_Name))].filter(Boolean);
      
      setProductTypes(uniqueProductTypes);
      setProducts(uniqueProducts);

      setFilteredData({
        productData,
        priceData,
        communicationData,
        supportData
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
  };

  const applyFilters = () => {
    let filteredProductData = filteredData.productData;
    let filteredPriceData = filteredData.priceData;
    let filteredCommunicationData = filteredData.communicationData;
    let filteredSupportData = filteredData.supportData;

    // Apply product type filter
    if (selectedProductType !== "all") {
      filteredProductData = filteredProductData.filter(row => row.Product_Type === selectedProductType);
      const productIds = filteredProductData.map(row => row.Product_ID);
      filteredPriceData = filteredPriceData.filter(row => productIds.includes(row.Product_ID));
      filteredCommunicationData = filteredCommunicationData.filter(row => productIds.includes(row.Product_ID));
      filteredSupportData = filteredSupportData.filter(row => productIds.includes(row.Product_ID));
    }

    // Apply product filter
    if (selectedProduct !== "all") {
      filteredProductData = filteredProductData.filter(row => row.Product_Name === selectedProduct);
      const productIds = filteredProductData.map(row => row.Product_ID);
      filteredPriceData = filteredPriceData.filter(row => productIds.includes(row.Product_ID));
      filteredCommunicationData = filteredCommunicationData.filter(row => productIds.includes(row.Product_ID));
      filteredSupportData = filteredSupportData.filter(row => productIds.includes(row.Product_ID));
    }

    setFilteredData({
      productData: filteredProductData,
      priceData: filteredPriceData,
      communicationData: filteredCommunicationData,
      supportData: filteredSupportData
    });
  };

  const availableProducts = selectedProductType === "all" 
    ? products 
    : filteredData.productData
        .filter(row => row.Product_Type === selectedProductType)
        .map(row => row.Product_Name);

  if (!allDatasetsLoaded) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Datasets are not yet loaded. Please load all required datasets to view Consumer Duty stats.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Consumer Duty Stats</h1>
          <p className="text-muted-foreground">KPI dashboards for Consumer Duty outcomes</p>
        </div>
        <Badge variant="default" className="flex items-center gap-2 bg-green-600 text-white">
          <CheckCircle className="h-4 w-4" />
          All Datasets Loaded
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Outcome</label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {outcomes.map(outcome => (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      {outcome.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Product Category</label>
              <Select value={selectedProductType} onValueChange={setSelectedProductType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {productTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {availableProducts.map(product => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Dashboards */}
      <div className="space-y-6">
        {(selectedOutcome === "all" || selectedOutcome === "products-services") && (
          <ProductsServicesKPI data={filteredData.productData} />
        )}
        
        {(selectedOutcome === "all" || selectedOutcome === "price-value") && (
          <PriceValueKPI data={filteredData.priceData} />
        )}
        
        {(selectedOutcome === "all" || selectedOutcome === "consumer-understanding") && (
          <ConsumerUnderstandingKPI data={filteredData.communicationData} />
        )}
        
        {(selectedOutcome === "all" || selectedOutcome === "consumer-support") && (
          <ConsumerSupportKPI data={filteredData.supportData} />
        )}
      </div>
    </div>
  );
}