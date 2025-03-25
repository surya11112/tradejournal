import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import DailyJournal from "@/pages/DailyJournal";
import Trades from "@/pages/Trades";
import Notebook from "@/pages/Notebook";
import Reports from "@/pages/Reports";
import Playbooks from "@/pages/Playbooks";
import Backtesting from "@/pages/Backtesting";
import ProgressTracker from "@/pages/ProgressTracker";
import ResourceCenter from "@/pages/ResourceCenter";
import TradeReplayPage from "@/pages/TradeReplay";
import RawTradeDetails from "@/pages/RawTradeDetails";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/journal" component={DailyJournal} />
      <Route path="/trades" component={Trades} />
      <Route path="/notebook" component={Notebook} />
      <Route path="/reports" component={Reports} />
      <Route path="/playbooks" component={Playbooks} />
      <Route path="/backtesting" component={Backtesting} />
      <Route path="/progress" component={ProgressTracker} />
      <Route path="/replay" component={TradeReplayPage} />
      <Route path="/resources" component={ResourceCenter} />
      <Route path="/trade/:id" component={RawTradeDetails} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
