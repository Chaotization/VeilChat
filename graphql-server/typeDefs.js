
export const typeDefs = `#graphql
  type Query {
    users:[User],
    getUserById(_id:String!):User

  }

  type User {
    id: String!
    first_name: String!
    last_name:String!
    email:String!
    city:String!
    state:String!
    country:String!
    friends:[String!]
    role:String
    status:String
  }
  


   type Mutation {
    addArtist(name: String!, dateFormed: Date!, members: [String!]!) : Artist
    editArtist(_id: String!, name: String, dateFormed: Date, members: [String!]) : Artist
    removeArtist(_id: String!) : Artist
    addCompany(name: String!, foundedYear: Int!, country: String!) : RecordCompany
    editCompany(_id: String!, name: String, foundedYear: Int, country: String) : RecordCompany
    removeCompany(_id: String!) : RecordCompany
    addAlbum(title: String!, releaseDate: Date!, genre: MusicGenre!, artistId: String!, companyId: String!) : Album
    editAlbum(_id: String!, title: String, releaseDate: Date, genre: MusicGenre, artistId: String, companyId: String):Album
    removeAlbum(_id: String!) : Album
    addSong(title: String!, duration: String!, albumId: String!): Song
    editSong(_id: String!, title: String, duration: String, albumId: String):Song
    removeSong(_id:String!):Song
  }
`;
