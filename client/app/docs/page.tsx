import { DocsLayout } from "@/components/docs-layout"
import { SimpleSidebar } from "@/components/simple-sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { CodeBlock } from "@/components/code-block"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const sidebarItems = [
  { title: "Overview", href: "#overview", section: "overview" },
  { title: "Prerequisites", href: "#prerequisites", section: "prerequisites" },
  { title: "Connecting Your Database", href: "#connecting", section: "connecting" },
  { title: "Using the Chat Interface", href: "#chat-interface", section: "chat-interface" },
  { title: "Security & Privacy", href: "#security", section: "security" },
  { title: "Troubleshooting", href: "#troubleshooting", section: "troubleshooting" },
  { title: "FAQ", href: "#faq", section: "faq" },
  { title: "Getting Help", href: "#help", section: "help" },
  { title: "Additional Resources", href: "#resources", section: "resources" },
]

export default function DocsPage() {
  return (
    <DocsLayout>
      <DashboardHeader
        heading="Text-to-SQL Chat Documentation"
        text="Learn how to use SQL Chat Assistant to interact with your database using natural language"
      />

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-6">
        <aside className="md:sticky md:top-20 md:self-start md:h-[calc(100vh-5rem)] overflow-y-auto">
          <SimpleSidebar items={sidebarItems} />
        </aside>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <section id="overview" className="scroll-mt-16">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Getting Started</Badge>
              <h2 className="text-3xl font-bold tracking-tight">1. Overview</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Text-to-SQL Chat Assistant transforms your database interactions into natural conversations. Here's what you can do:
            </p>
            <Card className="p-6 mb-8">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Provide your database connection string securely</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Use a chat interface to ask questions in plain language</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Automatically generate SQL queries to retrieve, update, or manage your data</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <span>Review and edit the generated SQL before execution (if needed)</span>
                </li>
              </ul>
            </Card>
          </section>

          <section id="prerequisites" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Setup</Badge>
              <h2 className="text-3xl font-bold tracking-tight">2. Prerequisites</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Before you begin using SQL Chat Assistant, ensure you have the following:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Database Connection String</h3>
                <p className="text-muted-foreground mb-4">Make sure you have the correct DB string. Examples include:</p>
                <Card className="p-6">
                  <ul className="space-y-4">
                    <li>
                      <strong>PostgreSQL:</strong>
                      <CodeBlock code="postgres://username:password@host:port/database" language="plaintext" />
                    </li>
                    <li>
                      <strong>MySQL:</strong>
                      <CodeBlock code="mysql://username:password@host:port/database" language="plaintext" />
                    </li>
                    <li>
                      <strong>SQL Server:</strong>
                      <CodeBlock code="Server=host;Database=database;User Id=username;Password=password;" language="plaintext" />
                    </li>
                  </ul>
                </Card>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Supported Databases</h3>
                <p className="text-muted-foreground">Check our comprehensive list of supported SQL databases.</p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Security Considerations</h3>
                <p className="text-muted-foreground">Ensure your credentials are stored securely; our platform encrypts sensitive data.</p>
              </div>
            </div>
          </section>

          <section id="connecting" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Setup</Badge>
              <h2 className="text-3xl font-bold tracking-tight">3. Connecting Your Database</h2>
            </div>
            <p className="text-lg text-muted-foreground mb-6">
              Follow these simple steps to connect your database:
            </p>

            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-2xl font-semibold mb-4">1. Enter Your DB String</h3>
                <p className="text-muted-foreground">Paste your database connection string into the provided field on the homepage.</p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">2. Test Connection</h3>
                <p className="text-muted-foreground">
                  Click the "Test Connection" button. Our system will attempt to connect and display a success or error message.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">3. Secure Storage</h3>
                <p className="text-muted-foreground">
                  Once connected, your credentials are stored securely using encryption (details in our Security section).
                </p>
              </div>
            </Card>
          </section>

          <section id="chat-interface" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Usage</Badge>
              <h2 className="text-3xl font-bold tracking-tight">4. Using the Chat Interface</h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Asking Questions</h3>
                <p className="text-muted-foreground mb-4">
                  Simply type your query in plain language (e.g., "Show me all orders from last month").
                </p>
                <p className="text-muted-foreground">
                  The system uses natural language processing to convert your request into a SQL query.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Reviewing Generated SQL</h3>
                <p className="text-muted-foreground mb-4">
                  For transparency, the generated SQL is displayed alongside the chat response.
                </p>
                <p className="text-muted-foreground">
                  You can review and optionally modify the SQL before it runs on your database.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Example Interaction</h3>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">User:</p>
                      <p className="text-muted-foreground">"List the names and emails of all customers who signed up in the last 30 days."</p>
                    </div>
                    <div>
                      <p className="font-medium">System (SQL Preview):</p>
                      <CodeBlock
                        code={`SELECT name, email FROM Customers 
WHERE signup_date >= CURRENT_DATE - INTERVAL '30' DAY;`}
                        language="sql"
                      />
                    </div>
                    <div>
                      <p className="font-medium">System (Chat Response):</p>
                      <p className="text-muted-foreground">"Here are the customers who signed up in the last 30 days."</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          <section id="security" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Security</Badge>
              <h2 className="text-3xl font-bold tracking-tight">5. Security & Privacy</h2>
            </div>
            <Card className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <strong className="block mb-1">Encryption</strong>
                    <p className="text-muted-foreground">Your DB credentials are encrypted both in transit and at rest.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <strong className="block mb-1">Access Control</strong>
                    <p className="text-muted-foreground">Our platform uses fine-grained access controls to ensure that only authorized queries are executed.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <strong className="block mb-1">No Data Logging</strong>
                    <p className="text-muted-foreground">We do not store your query data permanently unless you opt in for troubleshooting.</p>
                  </div>
                </li>
              </ul>
            </Card>
          </section>

          <section id="troubleshooting" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Support</Badge>
              <h2 className="text-3xl font-bold tracking-tight">6. Troubleshooting</h2>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Connection Issues</h3>
                <Card className="p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <strong className="block mb-1">Invalid String</strong>
                        <p className="text-muted-foreground">Double-check your connection string for typos.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <strong className="block mb-1">Network Problems</strong>
                        <p className="text-muted-foreground">Ensure your database is accessible from your current network.</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <div>
                        <strong className="block mb-1">Unsupported DB</strong>
                        <p className="text-muted-foreground">Verify that your database type is on our supported list.</p>
                      </div>
                    </li>
                  </ul>
                </Card>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4">Query Errors</h3>
                <Card className="p-6">
                  <p className="text-muted-foreground mb-4">
                    If the generated SQL returns an error, check the detailed message provided.
                  </p>
                  <p className="text-muted-foreground">
                    Common issues include mismatched field names or syntax errors due to database-specific SQL dialects.
                  </p>
                </Card>
              </div>
            </div>
          </section>

          <section id="faq" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">FAQ</Badge>
              <h2 className="text-3xl font-bold tracking-tight">7. Frequently Asked Questions</h2>
            </div>
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Q: What if my database type isn't supported?</h3>
                <p className="text-muted-foreground">A: Please refer to our supported databases list or contact support for assistance.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Q: Can I edit the generated SQL query?</h3>
                <p className="text-muted-foreground">A: Yes, the SQL preview allows you to modify the query before execution.</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Q: How secure is my data?</h3>
                <p className="text-muted-foreground">
                  A: We prioritize security using encryption and secure access protocols. See our Security section for more details.
                </p>
              </div>
            </Card>
          </section>

          <section id="help" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Support</Badge>
              <h2 className="text-3xl font-bold tracking-tight">8. Getting Help & Feedback</h2>
            </div>
            <Card className="p-6 space-y-4">
              <div>
                <strong className="block mb-2">Support</strong>
                <p className="text-muted-foreground">
                  If you encounter any issues, please contact our support team at support@example.com.
                </p>
              </div>
              <div>
                <strong className="block mb-2">Feedback</strong>
                <p className="text-muted-foreground">
                  We value your feedback to help us improve. Use the feedback form on our website to share your thoughts.
                </p>
              </div>
            </Card>
          </section>

          <section id="resources" className="scroll-mt-16 pt-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Resources</Badge>
              <h2 className="text-3xl font-bold tracking-tight">9. Additional Resources</h2>
            </div>
            <Card className="p-6">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <strong className="block mb-1">API Documentation</strong>
                    <p className="text-muted-foreground">For developers who want to integrate our service.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <strong className="block mb-1">Security Whitepaper</strong>
                    <p className="text-muted-foreground">Detailed information on our encryption and data handling practices.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div>
                    <strong className="block mb-1">User Forum</strong>
                    <p className="text-muted-foreground">Join our community for tips and best practices.</p>
                  </div>
                </li>
              </ul>
            </Card>
          </section>
        </div>
      </div>
    </DocsLayout>
  )
}

