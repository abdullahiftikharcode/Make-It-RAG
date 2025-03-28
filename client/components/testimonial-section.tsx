"use client"

import { useRef } from "react"
import { useInView } from "framer-motion"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

const testimonials = [
  {
    quote:
      "SQL Chat Assistant has completely transformed how our team interacts with our database. What used to take hours of complex SQL queries now takes minutes with simple English questions.",
    author: "Sarah Johnson",
    role: "Data Analyst at Acme Inc.",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "The natural language interface is incredibly intuitive. Our business team can now get insights directly without waiting for the technical team to write queries.",
    author: "Michael Chen",
    role: "Product Manager at Globex",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "Security was our main concern, but SQL Chat's encryption and access controls gave us confidence. Now we enjoy both convenience and peace of mind.",
    author: "Alex Rodriguez",
    role: "CTO at Initech",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "The ability to review and edit the generated SQL before execution gives us the perfect balance of automation and control.",
    author: "Emily Wong",
    role: "Database Administrator at Stark Industries",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    quote:
      "We've reduced our reporting time by 70% since implementing SQL Chat Assistant. It's been a game-changer for our analytics team.",
    author: "David Miller",
    role: "Head of Analytics at Umbrella Corp",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export function TestimonialSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section className="w-full py-20 md:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          ref={ref}
        >
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Loved by Data Teams Everywhere
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              See what our customers have to say about their experience with SQL Chat Assistant.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex flex-col gap-4 p-6">
                        <div className="flex-1">
                          <p className="text-muted-foreground">"{testimonial.quote}"</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                            <AvatarFallback>
                              {testimonial.author
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium leading-none">{testimonial.author}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-2">
              <CarouselPrevious className="relative inset-0 translate-y-0" />
              <CarouselNext className="relative inset-0 translate-y-0" />
            </div>
          </Carousel>
        </motion.div>
      </div>
    </section>
  )
}

