// src/app/nfts/trade/page.jsx
"use client";
import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function NFTTradePage() {
  const [userNFTs, setUserNFTs] = useState([]);
  const [availableNFTs, setAvailableNFTs] = useState([]);
  const [selectedUserNFTs, setSelectedUserNFTs] = useState([]);
  const [targetNFT, setTargetNFT] = useState(null);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tradePossible, setTradePossible] = useState(false);
  const [totalOfferedValue, setTotalOfferedValue] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Kullanıcının NFT'lerini getir
        const userNFTsResponse = await fetch('/api/nfts/user/');
        if (!userNFTsResponse.ok) {
          throw new Error('Failed to fetch user NFTs');
        }
        const userNFTsData = await userNFTsResponse.json();
        setUserNFTs(userNFTsData);
        
        // Takas için mevcut NFT'leri getir (sadece abonelik NFT'leri)
        const availableNFTsResponse = await fetch('/api/nfts/available/');
        if (!availableNFTsResponse.ok) {
          throw new Error('Failed to fetch available NFTs');
        }
        const availableNFTsData = await availableNFTsResponse.json();
        
        // Sadece abonelik tipindeki NFT'leri filtrele
        const subscriptionNFTs = availableNFTsData.filter(nft => 
          nft.NFTType?.toLowerCase() === 'subscription' || nft.NFTTypeID === 2
        );
        
        setAvailableNFTs(subscriptionNFTs);
        
        // Takas geçmişini getir
        const tradeHistoryResponse = await fetch('/api/nfts/trade/history/');
        if (tradeHistoryResponse.ok) {
          const tradeHistoryData = await tradeHistoryResponse.json();
          setTradeHistory(tradeHistoryData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    // Calculate total offered value
    const total = selectedUserNFTs.reduce((sum, nftId) => {
      const nft = userNFTs.find(n => n.NFTID === nftId);
      return sum + (nft ? nft.TradeValue : 0);
    }, 0);
    
    setTotalOfferedValue(total);
    
    // Check if trade is possible
    if (targetNFT && total >= targetNFT.TradeValue) {
      setTradePossible(true);
    } else {
      setTradePossible(false);
    }
  }, [selectedUserNFTs, targetNFT, userNFTs]);

  const handleSelectUserNFT = (nftId) => {
    if (selectedUserNFTs.includes(nftId)) {
      setSelectedUserNFTs(selectedUserNFTs.filter(id => id !== nftId));
    } else {
      setSelectedUserNFTs([...selectedUserNFTs, nftId]);
    }
  };

  const handleSelectTargetNFT = (nft) => {
    setTargetNFT(nft);
  };

  const handleClearSelection = () => {
    setSelectedUserNFTs([]);
    setTargetNFT(null);
  };

  const handleInitiateTrade = async () => {
    if (!targetNFT || selectedUserNFTs.length === 0) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/nfts/trade/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetNftId: targetNFT.NFTID,
          offeredNftIds: selectedUserNFTs,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete trade');
      }
      
      const data = await response.json();
      console.log("Trade result:", data);
      
      // Otomatik tamamlanan ticaret için başarı mesajını ayarla
      setSuccessMessage(`Trade completed successfully! You have acquired "${data.targetNftTitle}".`);
      
      // Reset selections
      setSelectedUserNFTs([]);
      setTargetNFT(null);
      
      // Refresh data
      fetchTradeData();
      
      // İlgili sayfaya yönlendirme için timeout ayarla
      if (data.clientRedirect) {
        setTimeout(() => {
          router.push(data.clientRedirect);
        }, 3000);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Verileri yeniden yüklemeyi kolaylaştırmak için yardımcı fonksiyon
  const fetchTradeData = async () => {
    try {
      // Kullanıcının NFT'lerini getir
      const userNFTsResponse = await fetch('/api/nfts/user/');
      if (userNFTsResponse.ok) {
        const userNFTsData = await userNFTsResponse.json();
        setUserNFTs(userNFTsData);
      }
      
      // Takas için mevcut NFT'leri getir (sadece abonelik NFT'leri)
      const availableNFTsResponse = await fetch('/api/nfts/available/');
      if (availableNFTsResponse.ok) {
        const availableNFTsData = await availableNFTsResponse.json();
        
        // Sadece abonelik tipindeki NFT'leri filtrele
        const subscriptionNFTs = availableNFTsData.filter(nft => 
          nft.NFTType?.toLowerCase() === 'subscription' || nft.NFTTypeID === 2
        );
        
        setAvailableNFTs(subscriptionNFTs);
      }
      
      // Takas geçmişini getir
      const tradeHistoryResponse = await fetch('/api/nfts/trade/history/');
      if (tradeHistoryResponse.ok) {
        const tradeHistoryData = await tradeHistoryResponse.json();
        setTradeHistory(tradeHistoryData);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    }
  };

  if (loading && userNFTs.length === 0) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p>Loading NFT data...</p>
      </div>
    </MainLayout>
  );

  if (error) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    </MainLayout>
  );

  const eligibleUserNFTs = userNFTs.filter(nft => 
    !nft.IsMinted && (!nft.ExpiryDate || new Date(nft.ExpiryDate) > new Date())
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">NFT Trading Platform</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Trading Information</p>
          <p>You can trade your earned NFTs for subscription NFTs to access premium content. Only subscription NFTs can be acquired through trading.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Your Available NFTs</h2>
              
              {eligibleUserNFTs.length === 0 ? (
                <p className="text-gray-500">You don't have any NFTs available for trading</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Select the NFTs you want to offer for trade
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {eligibleUserNFTs.map((nft) => (
                      <div 
                        key={nft.NFTID} 
                        className={`border rounded p-3 cursor-pointer ${
                          selectedUserNFTs.includes(nft.NFTID) ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleSelectUserNFT(nft.NFTID)}
                      >
                        <div className="flex items-start">
                          {nft.ImageURI ? (
                            <img 
                              src={nft.ImageURI} 
                              alt={nft.Title} 
                              className="w-16 h-16 object-cover rounded mr-3"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium">{nft.Title}</h3>
                            <p className="text-sm text-gray-600">Type: {nft.NFTType}</p>
                            <p className="text-sm text-gray-600">Value: {nft.TradeValue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Target NFTs */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Available Subscription NFTs</h2>
              
              {availableNFTs.length === 0 ? (
                <p className="text-gray-500">No subscription NFTs available for trading at the moment</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Select the subscription NFT you want to acquire
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {availableNFTs.map((nft) => (
                      <div 
                        key={nft.NFTID} 
                        className={`border rounded p-3 cursor-pointer ${
                          targetNFT && targetNFT.NFTID === nft.NFTID ? 'border-green-500 bg-green-50' : ''
                        }`}
                        onClick={() => handleSelectTargetNFT(nft)}
                      >
                        <div className="flex items-start">
                          {nft.ImageURI ? (
                            <img 
                              src={nft.ImageURI} 
                              alt={nft.Title} 
                              className="w-16 h-16 object-cover rounded mr-3"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded mr-3 flex items-center justify-center">
                              <span className="text-gray-500">No image</span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-medium">{nft.Title}</h3>
                            <p className="text-sm text-gray-600">Type: {nft.NFTType}</p>
                            <p className="text-sm text-gray-600">Required Value: {nft.TradeValue}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Trade Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Trade Summary</h2>
          
          {/* Başarı mesajını göster */}
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
              <p className="font-medium">Success!</p>
              <p>{successMessage}</p>
            </div>
          )}
          
          {/* Hata mesajını göster */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">You are offering:</h3>
              {selectedUserNFTs.length === 0 ? (
                <p className="text-gray-500">No NFTs selected</p>
              ) : (
                <div>
                  <ul className="space-y-2">
                    {selectedUserNFTs.map((nftId) => {
                      const nft = userNFTs.find(n => n.NFTID === nftId);
                      return nft ? (
                        <li key={nftId} className="flex justify-between">
                          <span>{nft.Title}</span>
                          <span className="font-medium">Value: {nft.TradeValue}</span>
                        </li>
                      ) : null;
                    })}
                  </ul>
                  <div className="mt-4 pt-2 border-t">
                    <div className="flex justify-between font-medium">
                      <span>Total Offered Value:</span>
                      <span>{totalOfferedValue}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">You will receive:</h3>
              {!targetNFT ? (
                <p className="text-gray-500">No target NFT selected</p>
              ) : (
                <div>
                  <div className="flex justify-between mb-2">
                    <span>{targetNFT.Title}</span>
                    <span className="font-medium">Value: {targetNFT.TradeValue}</span>
                  </div>
                  
                  <div className="mt-4 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Required Value:</span>
                      <span className="font-medium">{targetNFT.TradeValue}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>Offered Value:</span>
                      <span className={`font-medium ${
                        totalOfferedValue >= targetNFT.TradeValue ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {totalOfferedValue} {totalOfferedValue >= targetNFT.TradeValue ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleInitiateTrade}
              disabled={!tradePossible || loading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : 'Complete Trade Now'}
            </button>
            <button
              onClick={handleClearSelection}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
          
          {!tradePossible && selectedUserNFTs.length > 0 && targetNFT && (
            <p className="text-red-600 mt-2">
              Your offered NFTs don't meet the required value for this trade. Please select more NFTs.
            </p>
          )}
        </div>
        
        {/* Trade History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Trade History</h2>
          
          {tradeHistory.length === 0 ? (
            <p className="text-gray-500">No previous trades found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target NFT</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offered NFTs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tradeHistory.map((trade) => (
                    <tr key={trade.TradeID}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(trade.CreationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {trade.TargetNFTImage ? (
                            <img 
                              src={trade.TargetNFTImage} 
                              alt={trade.TargetNFTTitle} 
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          ) : null}
                          <span>{trade.TargetNFTTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {trade.offeredNFTs && trade.offeredNFTs.map((nft) => (
                            <span key={nft.NFTID} className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {nft.Title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          trade.TradeStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          trade.TradeStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trade.TradeStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}