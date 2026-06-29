package com.voyara.config;

import com.voyara.entity.JoinRequest;
import com.voyara.entity.Post;
import com.voyara.entity.Trip;
import com.voyara.entity.User;
import com.voyara.repository.JoinRequestRepository;
import com.voyara.repository.PostRepository;
import com.voyara.repository.TripRepository;
import com.voyara.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
@Profile({"default", "dev"})
public class DataSeeder implements CommandLineRunner {

    private static final String DEMO_PASSWORD = "voyara-demo-account";

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final TripRepository tripRepository;
    private final JoinRequestRepository joinRequestRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            UserRepository userRepository,
            PostRepository postRepository,
            TripRepository tripRepository,
            JoinRequestRepository joinRequestRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.tripRepository = tripRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }

        String hashed = passwordEncoder.encode(DEMO_PASSWORD);

        User srinath = userRepository.save(User.builder()
                .username("srinath")
                .email("srinathn.2212@gmail.com")
                .password(hashed)
                .bio("Dynamic travel enthusiast, passionate photographer, looking for hiking trails and local culinary guides around Kyoto!")
                .location("Bangalore, India")
                .avatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80")
                .build());

        User amelia = userRepository.save(User.builder()
                .username("amelia_explorer")
                .email("amelia@voyara.com")
                .password(hashed)
                .bio("Backpacking across Southeast Asia one country at a time.")
                .location("Bali, Indonesia")
                .avatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80")
                .build());

        User rohit = userRepository.save(User.builder()
                .username("rohit_mountains")
                .email("rohit@voyara.com")
                .password(hashed)
                .bio("Mountain guide and tea ritual expert in Himachal Pradesh.")
                .location("Manali, India")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80")
                .build());

        User alice = userRepository.save(User.builder()
                .username("alice_tokyo")
                .email("alice@voyara.com")
                .password(hashed)
                .bio("Tokyo city nights and Kyoto tea gardens.")
                .location("Tokyo, Japan")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80")
                .build());

        postRepository.save(Post.builder()
                .author(amelia)
                .image("https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=850&q=80")
                .caption("Waking up to morning waves in Uluwatu, Bali. Temples, surfing, and dynamic travel boards. Who's down to plan a boutique escapade for June?")
                .location("Uluwatu, Bali, Indonesia")
                .likes(new HashSet<>(Set.of(srinath)))
                .build());

        postRepository.save(Post.builder()
                .author(rohit)
                .image("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=850&q=80")
                .caption("Catching the first golden rays at Rohtang Pass, Manali. Crisp cold air, endless views of the Himalayas. Pure serenity.")
                .location("Manali, Himalayas, India")
                .likes(new HashSet<>())
                .build());

        postRepository.save(Post.builder()
                .author(alice)
                .image("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=850&q=80")
                .caption("Kyoto's bamboo forests are mesmerizing in the morning twilight. Walking here feels like stepping back through history.")
                .location("Arashiyama Bamboo Grove, Japan")
                .likes(new HashSet<>(Set.of(srinath, amelia)))
                .build());

        Trip manaliTrip = tripRepository.save(Trip.builder()
                .creator(rohit)
                .title("Manali Backpacking Expedition")
                .destination("Manali")
                .startDate("2026-06-15")
                .endDate("2026-06-20")
                .budget("$250")
                .totalSeats(5)
                .occupiedSeats(2)
                .description("Cozy shared wooden cabin, hiking to Jogini Falls, old Manali café crawls, and paragliding in Solang Valley. Budget includes shared rental SUV and local guides.")
                .members(new HashSet<>(Set.of(rohit, amelia)))
                .build());

        Trip kyotoTrip = tripRepository.save(Trip.builder()
                .creator(srinath)
                .title("Kyoto Zen Gardens & Tea Ceremonies")
                .destination("Kyoto")
                .startDate("2026-07-10")
                .endDate("2026-07-15")
                .budget("$850")
                .totalSeats(4)
                .occupiedSeats(1)
                .description("Traditional ryokan stay, early-morning meditation with local monks, tea rituals, and wandering Fushimi Inari at dusk to avoid crowds.")
                .members(new HashSet<>(Set.of(srinath)))
                .build());

        joinRequestRepository.save(JoinRequest.builder()
                .trip(manaliTrip)
                .sender(srinath)
                .host(rohit)
                .message("Hey Rohit! I would love to join your adventure in old Manali. I'm a great driver and guitarist, excited to share woodfired pizzas under the stars with you guys!")
                .status("pending")
                .build());

        joinRequestRepository.save(JoinRequest.builder()
                .trip(kyotoTrip)
                .sender(amelia)
                .host(srinath)
                .message("Hi Srinath, your Kyoto itinerary looks incredibly peaceful. I speak elementary Japanese and have already mapped out some stunning pottery shops in Higashiyama!")
                .status("pending")
                .build());
    }
}
