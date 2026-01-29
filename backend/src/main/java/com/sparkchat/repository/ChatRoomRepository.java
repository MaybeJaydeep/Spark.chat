package com.sparkchat.repository;

import com.sparkchat.model.ChatRoom;
import com.sparkchat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    Optional<ChatRoom> findByName(String name);
    
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m WHERE m.id = :userId AND cr.isActive = true")
    List<ChatRoom> findByMembersContaining(@Param("userId") Long userId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.createdBy.id = :userId AND cr.isActive = true")
    List<ChatRoom> findByCreatedBy(@Param("userId") Long userId);
    
    @Query("SELECT cr FROM ChatRoom cr JOIN cr.members m1 JOIN cr.members m2 " +
           "WHERE m1.id = :user1Id AND m2.id = :user2Id AND cr.roomType = 'DIRECT' AND cr.isActive = true")
    Optional<ChatRoom> findDirectChatRoom(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);
    
    List<ChatRoom> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    @Query("SELECT COUNT(m) FROM ChatRoom cr JOIN cr.members m WHERE cr.id = :roomId")
    Long countMembersByRoomId(@Param("roomId") Long roomId);
}