'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Mail, Loader2 } from 'lucide-react'

interface LoginDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
    const [email, setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn('google', { callbackUrl: '/editor' })
        } catch (error) {
            console.error('Google sign in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        setIsLoading(true)
        try {
            const result = await signIn('email', {
                email,
                callbackUrl: '/editor',
                redirect: false
            })

            if (result?.ok) {
                setEmailSent(true)
            }
        } catch (error) {
            console.error('Email sign in error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const resetDialog = () => {
        setEmail('')
        setEmailSent(false)
        setIsLoading(false)
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetDialog()
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {open && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />}
            <DialogContent className="sm:max-w-md bg-zinc-900/95 backdrop-blur-md border border-zinc-700/50 shadow-2xl z-50">
                <DialogHeader className="text-center space-y-3">
                    <DialogTitle className="text-xl font-semibold text-zinc-100">
                        {emailSent ? 'Check your email' : 'Sign in to continue'}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-sm leading-relaxed">
                        {emailSent
                            ? `We've sent a magic link to ${email}. Click the link in your email to sign in.`
                            : 'Sign in to export your video and save your projects.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {!emailSent ? (
                    <div className="space-y-6 pt-2">
                        <Button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="w-full h-11 bg-white hover:bg-gray-50 text-white border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
                            variant="outline"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                            ) : (
                                <img
                                    src="/images/icons/search.png"
                                    alt="Google"
                                    className="mr-3 h-4 w-4"
                                />
                            )}
                            Continue with Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <Separator className="w-full bg-zinc-700/50" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-900/95 px-3 text-zinc-500 font-medium">Or</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailSignIn} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11 bg-zinc-800/50 border-zinc-600/50 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 transition-all duration-200"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isLoading || !email}
                                className="w-full h-11 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                                ) : (
                                    <Mail className="mr-3 h-4 w-4" />
                                )}
                                Send magic link
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="space-y-6 pt-2">
                        <div className="flex items-center justify-center p-6 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                            <Mail className="h-10 w-10 text-zinc-400" />
                        </div>
                        <Button
                            onClick={() => setEmailSent(false)}
                            variant="outline"
                            className="w-full h-11 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-300 border-zinc-600/50 transition-all duration-200"
                        >
                            Try different email
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
