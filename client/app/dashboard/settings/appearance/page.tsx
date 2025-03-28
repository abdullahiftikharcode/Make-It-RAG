import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Sun, Moon, Monitor } from "lucide-react"

export default function AppearanceSettingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Appearance Settings" text="Customize the look and feel of your application." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Choose your preferred theme for the application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <RadioGroup defaultValue="system" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="light" id="theme-light" className="peer sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    Light
                    <div className="mt-2 w-full h-16 rounded-md bg-[#FFFFFF] border"></div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="theme-dark" className="peer sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    Dark
                    <div className="mt-2 w-full h-16 rounded-md bg-[#121212] border"></div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="theme-system" className="peer sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    System
                    <div className="mt-2 w-full h-16 rounded-md bg-gradient-to-r from-[#FFFFFF] to-[#121212] border"></div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Font Size</CardTitle>
            <CardDescription>Adjust the font size for better readability.</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup defaultValue="medium" className="grid grid-cols-3 gap-4">
              <div>
                <RadioGroupItem value="small" id="font-small" className="peer sr-only" />
                <Label
                  htmlFor="font-small"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-sm">Small</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="medium" id="font-medium" className="peer sr-only" />
                <Label
                  htmlFor="font-medium"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-base">Medium</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="large" id="font-large" className="peer sr-only" />
                <Label
                  htmlFor="font-large"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span className="text-lg">Large</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Animations</CardTitle>
            <CardDescription>Configure animation preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduce Motion</Label>
                <p className="text-sm text-muted-foreground">Minimize animations for accessibility purposes</p>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="reduce-motion-off">Off</Label>
                <RadioGroup defaultValue="off" className="flex">
                  <RadioGroupItem value="off" id="reduce-motion-off" />
                  <RadioGroupItem value="on" id="reduce-motion-on" />
                </RadioGroup>
                <Label htmlFor="reduce-motion-on">On</Label>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme Transitions</Label>
                <p className="text-sm text-muted-foreground">Smooth transitions when changing themes</p>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="theme-transitions-off">Off</Label>
                <RadioGroup defaultValue="on" className="flex">
                  <RadioGroupItem value="off" id="theme-transitions-off" />
                  <RadioGroupItem value="on" id="theme-transitions-on" />
                </RadioGroup>
                <Label htmlFor="theme-transitions-on">On</Label>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  )
}

