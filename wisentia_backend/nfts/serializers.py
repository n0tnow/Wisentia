from rest_framework import serializers

class NFTSerializer(serializers.Serializer):
    """NFT nesnesi için serializer"""
    NFTID = serializers.IntegerField(read_only=True)
    Title = serializers.CharField(max_length=100)
    Description = serializers.CharField(required=False)
    ImageURI = serializers.CharField(max_length=255)
    TradeValue = serializers.IntegerField()
    NFTType = serializers.CharField(source='TypeName', read_only=True)