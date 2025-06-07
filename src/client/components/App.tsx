import { FC } from "hono/jsx";
import { StatusBar } from "./StatusBar";
import { SourcePanel } from "./SourcePanel";
import { DocumentPanel } from "./DocumentPanel";

export const App: FC = () => {
  return (
    <div className="h-screen flex flex-col font-sans bg-gray-100">
      <StatusBar />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0">
          <SourcePanel />
        </div>
        
        <div className="flex-1">
          <DocumentPanel />
        </div>
      </div>
    </div>
  );
};
