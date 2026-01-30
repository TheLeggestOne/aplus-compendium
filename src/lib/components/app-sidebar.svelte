<script lang="ts">
    import AngryIcon from "@lucide/svelte/icons/angry";
    import HouseIcon from "@lucide/svelte/icons/house";
    import BookOpenIcon from "@lucide/svelte/icons/book-open";
    import SettingsIcon from "@lucide/svelte/icons/settings";
    import SmilePlusIcon from "@lucide/svelte/icons/smile-plus";
    import * as Sidebar from "$lib/components/ui/sidebar/index.js";
    // Menu items.
    const items = [
        {
            title: "Home",
            url: "#",
            icon: HouseIcon,
        },
        {
            title: "New Character",
            url: "#",
            icon: SmilePlusIcon,
        },
        {
            title: "Characters",
            url: "#",
            icon: AngryIcon,
        },
        {
            title: "Docs",
            url: "#",
            icon: BookOpenIcon,
        },
        {
            title: "Settings",
            url: "#",
            icon: SettingsIcon,
        },
    ];
</script>
 
<Sidebar.Root>
 <Sidebar.Content>
  <Sidebar.Group>
   <Sidebar.GroupLabel>APlus Compendium</Sidebar.GroupLabel>
   <Sidebar.GroupContent>
    <Sidebar.Menu>
     {#each items as item (item.title)}
      <Sidebar.MenuItem>
       <Sidebar.MenuButton>
        {#snippet child({ props })}
         <a href={item.url} {...props}>
          <item.icon />
          <span>{item.title}</span>
         </a>
        {/snippet}
       </Sidebar.MenuButton>
      </Sidebar.MenuItem>
     {/each}
    </Sidebar.Menu>
   </Sidebar.GroupContent>
  </Sidebar.Group>
 </Sidebar.Content>
</Sidebar.Root>