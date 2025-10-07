
import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  BarChart3,
  FileCheck,
  Shield,
  HelpCircle,
  DollarSign,
  MessageSquare,
  HeartHandshake,
  Users,
  FileText,
  Settings,
  ChevronRight,
  ChevronDown,
  Database,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const [consumerDutyOpen, setConsumerDutyOpen] = useState(true);
  const [vulnerableCustomersOpen, setVulnerableCustomersOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [promptsOpen, setPromptsOpen] = useState(false);

  const isCollapsed = state === "collapsed";

  const consumerDutyItems = [
    { title: "Datasets", url: "/consumer-duty/datasets", icon: Database },
    { title: "Consumer Duty Stats", url: "/consumer-duty/stats", icon: TrendingUp },
    { title: "Products & Services", url: "/consumer-duty/products-services", icon: FileCheck },
    { title: "Price & Value", url: "/consumer-duty/price-value", icon: DollarSign },
    { title: "Consumer Understanding", url: "/consumer-duty/understanding", icon: MessageSquare },
    { title: "Consumer Support", url: "/consumer-duty/support", icon: HeartHandshake },
  ];

  const vulnerableCustomerItems = [
    { title: "Upload Data", url: "/vulnerable-customers", icon: Database },
    { title: "Vulnerability Stats", url: "/vulnerable-customers/stats", icon: BarChart3 },
    { title: "Customer List", url: "/vulnerable-customers/list", icon: Users },
  ];

  const auditItems = [
    { title: "Audit Log", url: "/audit/log", icon: FileText },
    { title: "Audit Trail", url: "/audit/trail", icon: BarChart3 },
    { title: "Audit Report", url: "/audit/report", icon: FileCheck },
  ];

  const promptItems = [
    { title: "Prompt Library", url: "/prompts/library", icon: Settings },
    { title: "Prompt Log", url: "/prompts/log", icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      <SidebarContent className="px-2">
        {/* Consumer Duty Section */}
        <SidebarGroup>
          <Collapsible open={consumerDutyOpen} onOpenChange={setConsumerDutyOpen}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between p-2 hover:bg-secondary">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {!isCollapsed && <span>Consumer Duty</span>}
                </div>
                {!isCollapsed && (consumerDutyOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="ml-4">
                <SidebarMenu>
                  {consumerDutyItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={isActive(item.url) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                      >
                        <Link to={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Vulnerable Customers Section */}
        <SidebarGroup>
          <Collapsible open={vulnerableCustomersOpen} onOpenChange={setVulnerableCustomersOpen}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between p-2 hover:bg-secondary">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {!isCollapsed && <span>Vulnerable Customers</span>}
                </div>
                {!isCollapsed && (vulnerableCustomersOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="ml-4">
                <SidebarMenu>
                  {vulnerableCustomerItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={isActive(item.url) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                      >
                        <Link to={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Audit Reports Section */}
        <SidebarGroup>
          <Collapsible open={auditOpen} onOpenChange={setAuditOpen}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between p-2 hover:bg-secondary">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {!isCollapsed && <span>Audit Reports/Logs</span>}
                </div>
                {!isCollapsed && (auditOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="ml-4">
                <SidebarMenu>
                  {auditItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={isActive(item.url) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                      >
                        <Link to={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {/* Prompts Section */}
        <SidebarGroup>
          <Collapsible open={promptsOpen} onOpenChange={setPromptsOpen}>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="w-full justify-between p-2 hover:bg-secondary">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {!isCollapsed && <span>Prompts</span>}
                </div>
                {!isCollapsed && (promptsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ))}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="ml-4">
                <SidebarMenu>
                  {promptItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={isActive(item.url) ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                      >
                        <Link to={item.url}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
