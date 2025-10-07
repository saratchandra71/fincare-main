import { DataLoader } from "@/components/DataLoader";
import { DatasetViewer } from "@/components/DatasetViewer";
import { useData } from "@/contexts/DataContext";
import { Separator } from "@/components/ui/separator";

export default function Datasets() {
  const { allDatasetsLoaded } = useData();

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dataset Management</h1>
        <p className="text-muted-foreground">
          Load and view datasets required for Consumer Duty compliance analysis
        </p>
      </div>

      <div className="space-y-8">
        {/* Dataset Loading Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Dataset Loading</h2>
          <p className="text-muted-foreground mb-6">
            Load the following datasets into memory:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-1">
            <li><strong>ProductPerformance.csv</strong> as ProductData</li>
            <li><strong>PriceValue.csv</strong> as PricingData</li>
            <li><strong>ConsumerUnderstanding.csv</strong> as CommData</li>
            <li><strong>ConsumerSupport.csv</strong> as SupportData</li>
          </ul>
          <DataLoader />
        </section>

        <Separator />

        {/* Dataset Viewing Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Dataset Display</h2>
          <p className="text-muted-foreground mb-6">
            View loaded datasets in table format with full scrolling support
          </p>
          <DatasetViewer />
        </section>
      </div>
    </div>
  );
}