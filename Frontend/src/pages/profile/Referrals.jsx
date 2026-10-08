import React, { useState, useEffect } from 'react'
import { 
  Share2, 
  Copy, 
  CheckCircle, 
  Users, 
  Award, 
  QrCode as QrCodeIcon,
  MessageCircle,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Download,
  Gift,
  Coins,
  TrendingUp,
  Star,
  Link2,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Send,
  MessageSquare,
  Wallet,
  UserPlus,
  Loader2,
  Calendar,
  CreditCard,
  UserCheck,
  Hash,
  User,
  Clock,
  Image as ImageIcon
} from 'lucide-react'
import { toast } from 'react-toastify'
import { QRCodeSVG } from 'qrcode.react'
import Axios from '../../services/axios'
import { api } from '../../services/endpoints'

const Referrals = () => {
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [referralData, setReferralData] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const fetchReferralData = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true)
      setRefreshing(true)
      
      const res = await Axios.get(`${api.user.getReferrals}?page=${pageNum}&limit=10`)
      // console.log("Referral API Response:", res.data)
      
      if (res.data.success) {
        const data = res.data.data
        // console.log("Processed referral data:", data)
        
        if (pageNum === 1) {
          setReferralData(data)
        } else {
          setReferralData(prev => ({
            ...prev,
            referrals: [...prev.referrals, ...data.referrals],
            pagination: data.pagination
          }))
        }
        setHasMore(data.pagination?.hasMore || false)
      }
    } catch (error) {
      // console.error('Error fetching referral data:', error)
      const errorMsg = error?.response?.data?.message || 'Failed to load referral data'
      toast.error(errorMsg)
      
      if (pageNum === 1) {
        setReferralData({
          referralCode: "",
          totalReferrals: 0,
          totalReferralEarnings: 0,
          currentBalance: 0,
          referrals: [],
          pagination: { hasMore: false }
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadMore = () => {
    if (hasMore && !refreshing) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchReferralData(nextPage)
    }
  }

  const refreshData = () => {
    setPage(1)
    fetchReferralData(1)
  }

  useEffect(() => {
    fetchReferralData()
  }, [])

  const referralLink = referralData?.referralCode 
    ? `${window.location.origin}/register/${referralData.referralCode}`
    : ''

  const handleCopyLink = () => {
    if (!referralLink || !referralData?.referralCode) {
      toast.error('No referral link available')
      return
    }
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform) => {
    if (!referralLink || !referralData?.referralCode) {
      toast.error('No referral link available')
      return
    }

    const message = `Join me on VibeRide! Use my referral code "${referralData.referralCode}" to get ₹100 bonus. Register here: ${referralLink}`
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        break
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join me on VibeRide!')}`, '_blank')
        break
      case 'email':
        window.open(`mailto:?subject=Join me on VibeRide&body=${encodeURIComponent(message)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank')
        break
      default:
        if (navigator.share) {
          navigator.share({
            title: 'Join VibeRide',
            text: 'Join me on VibeRide!',
            url: referralLink,
          }).catch(() => {
            handleCopyLink()
          })
        } else {
          handleCopyLink()
        }
    }
  }

  const downloadQR = () => {
    if (!showQR || !referralLink) return
    
    try {
      const svg = document.getElementById('referral-qr')
      if (!svg) return
      
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const pngUrl = canvas.toDataURL("image/png")
        const downloadLink = document.createElement("a")
        downloadLink.href = pngUrl
        downloadLink.download = `viberide-referral-${referralData.referralCode || 'code'}.png`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        toast.success('QR code downloaded!')
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    } catch (error) {
      // console.error('Error downloading QR:', error)
      toast.error('Failed to download QR code')
    }
  }

  const getDefaultProfilePhoto = (profilePhotos) => {
    if (!profilePhotos || !Array.isArray(profilePhotos)) return null
    const defaultPhoto = profilePhotos.find(photo => photo.isDefault)
    return defaultPhoto || profilePhotos[0] || null
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || ''
    const last = lastName?.[0] || ''
    return `${first}${last}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#E10600] mx-auto mb-4" />
              <p className="text-[#555555]">Loading referral data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Refer & Earn</h1>
              <p className="text-[#555555] mt-1">Invite friends and earn rewards</p>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[#111111] hover:bg-[#F7F7F7] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Referral Code Card */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E10600]/10 rounded-lg flex items-center justify-center">
                  <Hash className="w-5 h-5 text-[#E10600]" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Your Code</p>
                  <p className="text-lg font-bold text-[#111111] font-mono">
                    {referralData?.referralCode || 'No Code'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              disabled={!referralData?.referralCode}
              className="w-full py-2.5 bg-[#E10600] text-white rounded-lg font-medium hover:bg-[#E10600]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Referral Link
                </>
              )}
            </button>
          </div>

          {/* Total Referrals Card */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Total Referrals</p>
                  <p className="text-2xl font-bold text-[#111111]">
                    {referralData?.totalReferrals || 0}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#555555]">Friends joined using your code</p>
          </div>

          {/* Earnings Card */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Coins className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Total Earnings</p>
                  <p className="text-2xl font-bold text-[#111111]">
                    ₹{referralData?.totalReferralEarnings || 0}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#555555]">Earned from referrals</p>
          </div>

          {/* Balance Card */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Current Balance</p>
                  <p className="text-2xl font-bold text-[#111111]">
                    ₹{referralData?.currentBalance || 0}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#555555]">Available to use</p>
          </div>
        </div>

        {/* How It Works & Share Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* How It Works */}
          <div className="lg:col-span-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6">
            <h2 className="text-lg font-bold text-[#111111] mb-4">How It Works</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E10600] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-[#111111] mb-1">Share Your Referral Link</h3>
                  <p className="text-sm text-[#555555]">Share your unique referral link with friends</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E10600] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-[#111111] mb-1">Friend Registers</h3>
                  <p className="text-sm text-[#555555]">Your friend signs up using your referral link</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#E10600] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-[#111111] mb-1">You Both Earn</h3>
                  <p className="text-sm text-[#555555]">You get ₹100 when your friend completes their first ride</p>
                </div>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="mt-6 p-4 bg-[#F7F7F7] rounded-lg border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#555555] mb-1">Your Referral Link</p>
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-[#555555] flex-shrink-0" />
                    <p className="text-[#111111] truncate font-mono text-sm">
                      {referralLink || 'Loading...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowQR(!showQR)}
                    disabled={!referralData?.referralCode}
                    className="p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors disabled:opacity-50"
                    title="Show QR Code"
                  >
                    <QrCodeIcon className="w-5 h-5 text-[#555555]" />
                  </button>
                  <button
                    onClick={handleCopyLink}
                    disabled={!referralData?.referralCode}
                    className="p-2 hover:bg-[var(--bg-surface)] rounded-lg transition-colors disabled:opacity-50"
                    title="Copy Link"
                  >
                    <Copy className="w-5 h-5 text-[#555555]" />
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              {showQR && referralData?.referralCode && (
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-[var(--bg-surface)] rounded-lg mb-4">
                      <QRCodeSVG
                        id="referral-qr"
                        value={referralLink}
                        size={150}
                        level="H"
                        includeMargin={true}
                        bgColor="#FFFFFF"
                        fgColor="#111111"
                      />
                    </div>
                    <button
                      onClick={downloadQR}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[#111111] hover:bg-[#F7F7F7] transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Share Options */}
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-6">
            <h2 className="text-lg font-bold text-[#111111] mb-4">Share Via</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('whatsapp')}
                disabled={!referralData?.referralCode}
                className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <MessageCircle className="w-6 h-6 text-emerald-600 mb-2" />
                <span className="text-sm font-medium text-emerald-700">WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('telegram')}
                disabled={!referralData?.referralCode}
                className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <Send className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-700">Telegram</span>
              </button>

              <button
                onClick={() => handleShare('email')}
                disabled={!referralData?.referralCode}
                className="p-4 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <Mail className="w-6 h-6 text-red-600 mb-2" />
                <span className="text-sm font-medium text-red-700">Email</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                disabled={!referralData?.referralCode}
                className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <Facebook className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-sm font-medium text-indigo-700">Facebook</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                disabled={!referralData?.referralCode}
                className="p-4 bg-sky-50 rounded-lg border border-sky-100 hover:bg-sky-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <Twitter className="w-6 h-6 text-sky-600 mb-2" />
                <span className="text-sm font-medium text-sky-700">Twitter</span>
              </button>

              <button
                onClick={() => handleShare('linkedin')}
                disabled={!referralData?.referralCode}
                className="p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
              >
                <Linkedin className="w-6 h-6 text-blue-700 mb-2" />
                <span className="text-sm font-medium text-blue-700">LinkedIn</span>
              </button>

              <button
                onClick={() => handleShare('native')}
                disabled={!referralData?.referralCode}
                className="col-span-2 p-4 bg-[#E10600]/10 rounded-lg border border-[#E10600]/20 hover:bg-[#E10600]/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Share2 className="w-5 h-5 text-[#E10600]" />
                <span className="text-sm font-medium text-[#E10600]">Other Apps</span>
              </button>
            </div>
          </div>
        </div>

        {/* Referrals List */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">Your Referrals</h2>
                <p className="text-sm text-[#555555] mt-1">
                  {referralData?.totalReferrals || 0} friend{referralData?.totalReferrals !== 1 ? 's' : ''} joined
                </p>
              </div>
              {referralData?.referrals?.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-[#555555]">
                  <UserCheck className="w-4 h-4" />
                  <span>{referralData?.totalReferrals || 0} joined</span>
                </div>
              )}
            </div>
          </div>

          {!referralData?.referrals?.length ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-[#F7F7F7] rounded-full flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-[#B8B8B8]" />
              </div>
              <h3 className="text-lg font-medium text-[#111111] mb-2">No Referrals Yet</h3>
              <p className="text-[#555555] max-w-md mx-auto mb-6">
                Share your referral link with friends to start earning rewards. You'll earn ₹100 for each friend who joins and completes their first ride.
              </p>
              <button
                onClick={() => handleShare('whatsapp')}
                disabled={!referralData?.referralCode}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E10600] text-white rounded-lg font-medium hover:bg-[#E10600]/90 transition-colors disabled:opacity-50"
              >
                <Share2 className="w-5 h-5" />
                Start Sharing Now
              </button>
            </div>
          ) : (
            <>
              <div className="divide-y divide-[#E5E5E5]">
                {referralData?.referrals?.map((referral, index) => {
                  const defaultPhoto = getDefaultProfilePhoto(referral.profilePhotos)
                  const initials = getInitials(referral.firstName, referral.lastName)
                  const fullName = referral.firstName && referral.lastName 
                    ? `${referral.firstName} ${referral.lastName}`
                    : referral.firstName || 'Anonymous User'
                  
                  return (
                    <div key={referral._id || index} className="p-6 hover:bg-[#F7F7F7] transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Profile Picture */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-white shadow-sm">
                              {defaultPhoto?.url ? (
                                <img 
                                  src={import.meta.env.VITE_ASSETS_URL + defaultPhoto.url} 
                                  alt={fullName}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                                  <span className="text-[#111111] font-bold text-lg">
                                    {initials}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Gender Badge */}
                            {referral.gender && (
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
                                referral.gender === 'female' ? 'bg-pink-100 text-pink-600' : 
                                referral.gender === 'male' ? 'bg-blue-100 text-blue-600' : 
                                'bg-gray-100 text-gray-600'
                              }`}>
                                <User className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-[#111111]">
                                {fullName}
                              </p>
                              {referral.gender && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  referral.gender === 'female' ? 'bg-pink-100 text-pink-700' : 
                                  referral.gender === 'male' ? 'bg-blue-100 text-blue-700' : 
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {referral.gender.charAt(0).toUpperCase() + referral.gender.slice(1)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#555555] mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>Joined {formatDate(referral.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <p className="font-medium text-emerald-600">₹100</p>
                          </div>
                          <div className="flex items-center justify-end gap-1 text-xs text-[#555555] mt-1">
                            <Coins className="w-3 h-3" />
                            <span>Earned</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {hasMore && (
                <div className="p-6 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={loadMore}
                    disabled={refreshing}
                    className="w-full py-3 bg-[#F7F7F7] hover:bg-[#E5E5E5] rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {refreshing ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#555555]" />
                    ) : (
                      <>
                        <span>Load More</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats Summary */}
        {referralData?.referrals?.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Referral Bonus</p>
                  <p className="text-lg font-bold text-[#111111]">₹100 per friend</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Total Earnings</p>
                  <p className="text-lg font-bold text-[#111111]">
                    ₹{referralData?.totalReferralEarnings || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-[#555555]">Referral Code</p>
                  <p className="text-lg font-bold text-[#111111] font-mono">
                    {referralData?.referralCode || 'No Code'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Referrals