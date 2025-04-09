from decimal import Decimal
import json
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework.renderers import JSONRenderer
from decimal import Decimal
import json

class CustomJSONEncoder(DjangoJSONEncoder):
    """Decimal ve diğer özel türleri JSON uyumlu hale getiren özel sınıf"""
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)

def custom_json_response(data, status=200):
    """Decimal türlerini içeren veriyi düzgün şekilde JSON'a çevirir"""
    from rest_framework.response import Response
    
    # Veriyi manuel olarak serialize ederek sorunları önle
    json_str = json.dumps(data, cls=CustomJSONEncoder)
    json_data = json.loads(json_str)
    
    return Response(json_data, status=status)



class CustomJSONRenderer(JSONRenderer):
    """
    Decimal türlerini float'a çeviren özel JSON renderer
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        # JSON'a çevirmeden önce Decimal değerlerini float'a dönüştür
        if data is not None:
            data = self.process_data(data)
        return super().render(data, accepted_media_type, renderer_context)
    
    def process_data(self, data):
        """Veriyi işleyerek Decimal türlerini float'a çevirir"""
        if isinstance(data, Decimal):
            return float(data)
        elif isinstance(data, dict):
            return {key: self.process_data(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self.process_data(item) for item in data]
        return data