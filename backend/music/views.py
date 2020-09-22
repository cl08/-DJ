from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, APIView
from rest_framework.permissions import IsAuthenticated
from .models import Song, Album, Artist
from .serializers import SongSerializer, AlbumSerializer, ArtistSerializer
# Create your views here.

class SongType(APIView):
    def get(self, request, emotion_type):
        songs = Song.objects.filter(type__exact=emotion_type).order_by('-like')[:10]
        serializer = SongSerializer(songs, many=True)
        return Response(serializer.data)

class SongDetail(APIView):
    def get(self, request,category, pk):
        if category == 'song':
            song = get_object_or_404(Song, pk=pk)
            serializer = SongSerializer(song)
        elif category == 'album':
            album = get_object_or_404(Album, pk=pk)
            serializer = AlbumSerializer(album)
        else:
            artist = get_object_or_404(Artist, pk=pk)
            serializer = ArtistSerializer(artist)
        return Response(serializer.data)