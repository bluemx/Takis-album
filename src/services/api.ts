// API service for all album-related requests
// DEMO MODE: All API calls are simulated using demoData.json
const API_BASE_URL = 'https://www.puntosfutbol.com/apialbum/api'
const API_KEY = 'vimSfZ8FCAB7U2ng6cG7YvVQDeIht'
const DEMO_MODE = true // Set to false to use real API

// Import demo data
import demoData from '../../demoData.json'

// Simulated delay to mimic network requests
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Generic API envelope
interface ApiEnvelope<T> {
  success: boolean
  errorCode: number
  errorDescription: string | null
  data: T
}

// Data models based on the real API
interface UserCard {
  id: number
  identifier: string | null
  resource: string
  token: number
  type: string
  inAlbum: boolean
  acRegId: number
}

interface PackToOpen {
  packTypeId: number
  packs: number
}

export interface StickerToView {
  stickerId: number
  identifier: number
  resource: string
  token: number
  stickerType: string
  inAlbum: boolean
  customerStickerStatusID: number
  customerStickerStatus: string
  nickNameGave: string
  avatarImage: string
}

interface CustomerStickersData {
  id: number
  avatar: string // base64 image data
  name: string
  email: string
  packsToOpen: PackToOpen[]
  userCards: UserCard[]
  stickersToView: StickerToView[]
}

type CustomerStickersResponse = ApiEnvelope<CustomerStickersData>

interface UpdateStickerPayloadItem {
  StickerId: number
  InAlbum: number // 0 or 1
}

type UpdateCustomerStickersResponse = ApiEnvelope<unknown>

export interface Friend {
  friendCustomerID: number
  nickname: string
  avatarImage: string // base64 image
  notInAlbum: number
}

type FriendsResponse = ApiEnvelope<Friend[]>

interface SendGiftStickerItem {
  customerStickerId: number
  ACRegId: number
}

// Removed unused SendGiftPayload interface

interface SendGiftData {
  message: string
}

type SendGiftResponse = ApiEnvelope<SendGiftData>

// Exchange/Trading interfaces
interface ExchangeOfferItem {
  customerStickerId: number
  ACRegId: number
}

interface ExchangeWantedItem {
  ACRegId: number
}

// Removed unused TryExchangePayload interface

export interface ExchangeMatch {
  resultId: number
  message: string
  customerId: number
  firstName: string
  email: string
  stickers: number
}

type TryExchangeResponse = ApiEnvelope<ExchangeMatch[]>

// Current Exchanges interfaces
export interface CurrentExchange {
  exchangeId: number
  customerIdOffers: number
  nickname: string
  avatarImage: string
  exchangeAddedDate: string
  stickersOffered: string // comma-separated identifiers
  stickersWanted: string // comma-separated identifiers
}

type CurrentExchangesResponse = ApiEnvelope<CurrentExchange[]>

// Removed unused CompleteExchangePayload interface

interface CompleteExchangeData {
  message: string
}

type CompleteExchangeResponse = ApiEnvelope<CompleteExchangeData>

interface CancelExchangeData {
  message: string
}

type CancelExchangeResponse = ApiEnvelope<CancelExchangeData>

// Demo data state management
let demoState = {
  ownedCards: [...demoData.ownedCards] as UserCard[],
  packsToOpen: [...demoData.packsToOpen] as PackToOpen[],
  stickersToView: demoData.stickersToView.map(s => ({
    ...s,
    nickNameGave: s.nickNameGave || '',
    avatarImage: s.avatarImage || ''
  })) as StickerToView[],
  friends: [...demoData.friends] as Friend[],
  currentExchanges: [...demoData.currentExchanges] as CurrentExchange[]
}

export const apiService = {
  async getCustomerStickers(customerId: string): Promise<CustomerStickersResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: getCustomerStickers called')
      await simulateDelay(300)
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: {
          id: demoData.user.id,
          avatar: demoData.user.avatar,
          name: demoData.user.name,
          email: demoData.user.email,
          packsToOpen: demoState.packsToOpen,
          userCards: demoState.ownedCards,
          stickersToView: demoState.stickersToView
        }
      }
    }

    const response = await fetch(`${API_BASE_URL}/CustomerStickers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        Customerid: customerId
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async updateCustomerStickers(customerId: string, stickers: UpdateStickerPayloadItem[]): Promise<UpdateCustomerStickersResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: updateCustomerStickers called', stickers)
      await simulateDelay(400)
      
      // Update demo state
      stickers.forEach(sticker => {
        const card = demoState.ownedCards.find(c => c.id === sticker.StickerId)
        if (card) {
          card.inAlbum = sticker.InAlbum === 1
        }
      })
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: { message: 'Stickers updated successfully' }
      }
    }

    const response = await fetch(`${API_BASE_URL}/UpdateCustomerStickers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        Customerid: customerId,
        Stickers: stickers
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async openPack(customerId: string, packTypeId: number = 1): Promise<CustomerStickersResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: openPack called', { packTypeId })
      await simulateDelay(800)
      
      // For demo mode, randomly select 5 cards from user's owned cards
      // Get unique card identifiers from owned cards
      const uniqueIdentifiers = [...new Set(demoState.ownedCards.map(c => c.identifier))]
      
      // Randomly select 5 identifiers (can repeat)
      const selectedIdentifiers: string[] = []
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * uniqueIdentifiers.length)
        selectedIdentifiers.push(uniqueIdentifiers[randomIndex])
      }
      
      // Create new cards from selected identifiers
      const newCards = selectedIdentifiers.map((identifier, index) => {
        // Find the original card to get its properties
        const originalCard = demoState.ownedCards.find(c => c.identifier === identifier)
        return {
          id: Date.now() + index, // Generate unique ID
          identifier: identifier,
          resource: `/cards/${identifier}.webp`,
          token: 1,
          type: originalCard?.type || 'normal',
          inAlbum: false, // New cards start as not in album
          acRegId: parseInt(identifier)
        }
      })
      
      // Add new cards to the state
      demoState.ownedCards = [...demoState.ownedCards, ...newCards]
      
      // Decrease pack count
      const packIndex = demoState.packsToOpen.findIndex(p => p.packTypeId === packTypeId)
      if (packIndex !== -1) {
        const pack = demoState.packsToOpen[packIndex]
        if (pack && pack.packs > 0) {
          pack.packs--
        }
      }
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: {
          id: demoData.user.id,
          avatar: demoData.user.avatar,
          name: demoData.user.name,
          email: demoData.user.email,
          packsToOpen: demoState.packsToOpen,
          userCards: newCards, // Only return the newly opened cards
          stickersToView: demoState.stickersToView
        }
      }
    }

    const response = await fetch(`${API_BASE_URL}/OpenPack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        Customerid: customerId,
        PackTypeId: packTypeId
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async getFriends(customerId: string): Promise<FriendsResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: getFriends called')
      await simulateDelay(300)
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: demoState.friends
      }
    }

    const response = await fetch(`${API_BASE_URL}/Friends`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        Customerid: customerId
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async sendGift(customerId: string, customerFriendId: number, stickers: SendGiftStickerItem[]): Promise<SendGiftResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: sendGift called', { customerFriendId, stickers })
      await simulateDelay(500)
      
      // Remove gifted cards from owned cards
      stickers.forEach(sticker => {
        const index = demoState.ownedCards.findIndex(c => c.id === sticker.customerStickerId)
        if (index !== -1) {
          demoState.ownedCards.splice(index, 1)
        }
      })
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: { message: 'Gift sent successfully' }
      }
    }

    const response = await fetch(`${API_BASE_URL}/SendGift`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        customerId: customerId,
        customerFriendId: customerFriendId,
        stickers: stickers
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async tryExchange(customerId: number, offer: ExchangeOfferItem[], wanted: ExchangeWantedItem[]): Promise<TryExchangeResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: tryExchange called', { offer, wanted })
      await simulateDelay(600)
      
      // Simulate finding potential matches
      const matches: ExchangeMatch[] = demoState.friends.slice(0, 2).map((friend, index) => ({
        resultId: index + 1,
        message: `Found match with ${friend.nickname}`,
        customerId: friend.friendCustomerID,
        firstName: friend.nickname,
        email: `${friend.nickname.toLowerCase()}@demo.com`,
        stickers: offer.length
      }))
      
      // Create exchange in state
      if (matches.length > 0) {
        const newExchange: CurrentExchange = {
          exchangeId: Date.now(),
          customerIdOffers: customerId,
          nickname: demoData.user.nickname,
          avatarImage: demoData.user.avatar,
          exchangeAddedDate: new Date().toISOString(),
          stickersOffered: offer.map(o => o.ACRegId).join(','),
          stickersWanted: wanted.map(w => w.ACRegId).join(',')
        }
        demoState.currentExchanges.push(newExchange)
      }
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: matches
      }
    }

    const response = await fetch(`${API_BASE_URL}/TryExchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        customerId: customerId,
        offer: offer,
        wanted: wanted
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async getCurrentExchanges(customerId: string): Promise<CurrentExchangesResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: getCurrentExchanges called')
      await simulateDelay(300)
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: demoState.currentExchanges
      }
    }

    const response = await fetch(`${API_BASE_URL}/CurrentExchanges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        Customerid: customerId
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async completeExchange(customerIdCompleted: number, exchangeId: number): Promise<CompleteExchangeResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: completeExchange called', { exchangeId })
      await simulateDelay(500)
      
      // Remove exchange from state
      const exchangeIndex = demoState.currentExchanges.findIndex(e => e.exchangeId === exchangeId)
      if (exchangeIndex !== -1) {
        const exchange = demoState.currentExchanges[exchangeIndex]
        if (!exchange) {
          return {
            success: false,
            errorCode: 404,
            errorDescription: 'Exchange not found',
            data: { message: 'Exchange not found' }
          }
        }
        
        // Add wanted cards to owned cards (simulate receiving cards)
        const wantedIdentifiers = exchange.stickersWanted.split(',').map(id => parseInt(id))
        wantedIdentifiers.forEach((identifier, index) => {
          const newCard: UserCard = {
            id: Date.now() + index,
            identifier: identifier.toString(),
            resource: `/cards/${identifier}.webp`,
            token: 1,
            type: 'normal',
            inAlbum: false,
            acRegId: identifier
          }
          demoState.ownedCards.push(newCard)
        })
        
        // Remove offered cards from owned cards
        const offeredIdentifiers = exchange.stickersOffered.split(',').map(id => parseInt(id))
        offeredIdentifiers.forEach(identifier => {
          const index = demoState.ownedCards.findIndex(c => 
            c.identifier === identifier.toString() && !c.inAlbum
          )
          if (index !== -1) {
            demoState.ownedCards.splice(index, 1)
          }
        })
        
        demoState.currentExchanges.splice(exchangeIndex, 1)
      }
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: { message: 'Exchange completed successfully' }
      }
    }

    const response = await fetch(`${API_BASE_URL}/CompleteExchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        CustomerIdCompleted: customerIdCompleted,
        ExchangeId: exchangeId
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  async cancelExchange(customerId: string, exchangeId: number): Promise<CancelExchangeResponse> {
    if (DEMO_MODE) {
      console.log('🎮 DEMO MODE: cancelExchange called', { exchangeId })
      await simulateDelay(400)
      
      // Remove exchange from state
      const exchangeIndex = demoState.currentExchanges.findIndex(e => e.exchangeId === exchangeId)
      if (exchangeIndex !== -1) {
        demoState.currentExchanges.splice(exchangeIndex, 1)
      }
      
      return {
        success: true,
        errorCode: 0,
        errorDescription: null,
        data: { message: 'Exchange cancelled successfully' }
      }
    }

    const response = await fetch(`${API_BASE_URL}/CancelExchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        Customerid: customerId,
        ExchangeId: exchangeId
      })
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  }
}